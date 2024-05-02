import { Injectable, Logger } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { BlockTx } from "../../db/models/BlockTx";
import { BlockTxRepository } from "../../db/repositories/blocktx.repository";
import { SolanaClient } from "../solanaclient";

@Injectable()
export class SolanaDbService {
  protected readonly logger: Logger = new Logger(SolanaDbService.name);

  protected readonly solanaClient: SolanaClient;

  constructor(
    readonly em: EntityManager,
    readonly orm: MikroORM,
    readonly factoryService: FactoryService,
    readonly blockTxRepository: BlockTxRepository,
  ) {
    this.solanaClient = this.factoryService.solanaClient();
  }

  // note: this doesn't have a @context so should be executed in a transactional block

  // retrieves a tx from the db, or fetches it from solana and creates it in the db (if it doesn't exist)
  // if createOnly = true, then expect it to NOT exist in the db and throw an error if it does
  async getOrCreateDbTx(txid: string, createOnly: boolean = true): Promise<BlockTx> {
    let dbtx = await this.blockTxRepository.findOne({ txid });
    if (!dbtx) {
      this.logger.debug(`couldn't fetch tx: ${txid}, waiting for confirmation...`);
      const confirmed = await this.solanaClient.confirmTransaction(txid, "confirmed");
      if (confirmed) {
        this.logger.debug(`confirmed tx: ${txid}. fetching...`);
        const tx = await this.solanaClient.fetchTxForSync(txid);
        if (tx) {
          dbtx = await this.createDbTx(tx);
        }
      }
    } else if (createOnly) {
        throw new Error(`createOnly: BlockTx for ${txid} already exists.`);
    }
    return dbtx;
  }

  async createDbTx(tx: ParsedTransactionWithMeta): Promise<BlockTx> {
    const txTime = new Date(tx.blockTime * 1000);
    // create the tx
    const dbtx = new BlockTx(tx.transaction.signatures[0], txTime, tx.slot);
    const signer = tx.transaction.message.accountKeys[0].pubkey;
    dbtx.signer = signer.toBase58();
    await this.blockTxRepository.persistAndFlush(dbtx);
    return dbtx;
  }

}
