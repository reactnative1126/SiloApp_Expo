import { MikroORM, QueryOrder, UseRequestContext } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { TokenRepository } from "../../db/repositories/token.repository";
import { ConfigService } from "@nestjs/config";
import {
  TransferStatus,
  TransferTargetType,
  USER_STATUS
} from "../../db/db.types";
import { TransactionService } from "./transaction.service";
import { UserService } from "./user.service";
import { EmailService } from "./email.service";
import { SystemService } from "./system.service";
import { TransferService } from "./transfer.service";
import { TransferRepository } from "../../db/repositories/transfer.repository";
import { Transfer } from "../../db/models/Transfer";
import { SolanaClient } from "../../solana/solanaclient";
import { SolanaDbService } from "../../solana/service/solanadb.service";
import { AccountSync } from "../../solana/sync/account.sync";

@Injectable()
export class TransferProcessorService extends AbstractService {

  private initialUsdcFundAmountDecimal: number;
  private solanaClient: SolanaClient;

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly userService: UserService,
    readonly transferService: TransferService,
    readonly configService: ConfigService,
    readonly tokenRepository: TokenRepository,
    readonly transactionService: TransactionService,
    readonly transferRepository: TransferRepository,
    readonly solanaDbService: SolanaDbService,
    readonly emailService: EmailService,
    readonly accountSync: AccountSync,
  ) {
    super(TransferProcessorService.name, em, orm, factoryService, userRepository, systemService);
    this.solanaClient = this.factoryService.solanaClient();
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("TransferProcessorService initialized...");
  }

  async processTransfers() {
    const transferIds = await this.em.transactional(async em => {
      const transfers = await em.find(Transfer, {
        status: TransferStatus.CREATED,
        fromUser: { status: USER_STATUS.ACTIVE },
      }, { orderBy: { createdAt: QueryOrder.ASC } });
      return transfers.map(a => a.id);
    });
    for (const transferId of transferIds) {
      await this.processTransfer(transferId);
    }
  }

  private async checkAndUpdateStatus(transferId: number, expectedStatus: string, newStatus: string, error: string = null) {
    return await this.em.transactional(async em => {
      const transfer: Transfer = await this.transferRepository.findById(transferId);
      if (transfer.status !== expectedStatus) {
        // action could've gottend synced during processing by the syncer job
        throw new Error(`cannot update action ${transferId} status ${transfer.status}: is not expected status: ${expectedStatus}`);
      } else {
        transfer.status = newStatus;
        if (error) {
          transfer.error = error;
        }
        await em.persistAndFlush(transfer);
      }
      return transfer;
    });
  }

  // transfer to a rebelfi user
  async processUserTransfer(transfer: Transfer) {
    const fromUser = transfer.fromUser;
    const toUser = transfer.toUser;
    return await this.transactionService.transfer(fromUser, toUser.publicKey(), transfer.fromTokenAccount.token.publicKey(), transfer.amount, false);
  }

  // transfer to a solana address

  async processTransfer(transferId: number) {
    // mark as processing
    const transfer = await this.checkAndUpdateStatus(transferId, TransferStatus.CREATED, TransferStatus.PROCESSING);

    let updateStatus = TransferStatus.PROCESSED;
    let error = null;
    let txid = null;

    const targetType = transfer.targetType;
    switch(targetType) {
      case TransferTargetType.USER:
        txid = await this.processUserTransfer(transfer);
        break;
      case TransferTargetType.SOLANA_ADDRESS:
      case TransferTargetType.CONTACT:
      case TransferTargetType.PAYLINK:
      default:
        error = `Can't process target type: ${targetType}`;
        break;
    }

    // handle the data updates
    const parsedTx = await this.solanaClient.fetchTxForSync(txid);

    await this.em.transactional(async em => {
      em.merge(transfer);
      if (error) {
        transfer.errored(error);
      } else if (txid) {
        // retrieve the tx
        // todo: the AccountTx objects that get created in the sync won't contain the right counterparty info unless it's a rebeluser
        const blockTx = await this.accountSync.processParsedTx(parsedTx);
        transfer.processed(blockTx);

        // todo: notifications + emails
      }
      await em.persistAndFlush(transfer);
    });
  }

}
