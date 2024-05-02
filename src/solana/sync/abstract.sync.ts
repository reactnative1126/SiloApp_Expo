import { FactoryService } from "../../common/service/factory.service";
import { Connection, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { ISolanaClient } from "../solanaclient";
import Bottleneck from "bottleneck";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { BlockTxRepository } from "../../db/repositories/blocktx.repository";
import { MikroORM } from "@mikro-orm/core";
import { BlockTx } from "../../db/models/BlockTx";

@Injectable()
export class AbstractSync {
  protected readonly logger: Logger;

  protected connection: Connection;
  protected solanaClient: ISolanaClient;

  // throttle solana requests
  protected throttler: Bottleneck;

  protected readonly factoryService: FactoryService;

  protected readonly blockTxRepository: BlockTxRepository;
  protected readonly em: EntityManager;
  protected readonly orm: MikroORM;

  protected className: string;

  constructor(
    loggerName: string,
    factoryService: FactoryService,
    em: EntityManager,
    orm: MikroORM,
    txRepository: BlockTxRepository
  ) {
    this.logger = new Logger(loggerName);
    this.className = loggerName;
    this.factoryService = factoryService;
    this.blockTxRepository = txRepository;
    this.solanaClient = factoryService.solanaClient();
    this.throttler = factoryService.getSolanaThrottler();
    this.connection = this.solanaClient.getConnection();
    this.em = em;
    this.orm = orm;
  }

  async syncTx(txid: string): Promise<BlockTx> {
    // first see if we have the txid in the db already
    let dbtx = await this.blockTxRepository.findByTxid(txid);
    if (dbtx) {
      this.logger.debug(`already synced ${this.className} txid: ${txid}`);
      return dbtx;
    }
    const tx = await this.solanaClient.fetchTxForSync(txid);
    return await this.processTx(tx);
    /*
    const tx = await this.throttler.schedule(() => {
      return this.connection.getParsedTransaction(txid, {maxSupportedTransactionVersion: 0});
    });
    return await this.processTx(tx);
     */
  }

  // subclasses should implement this
  async processTx(tx: ParsedTransactionWithMeta): Promise<BlockTx> {
    throw new Error("not implemented");
  }
}
