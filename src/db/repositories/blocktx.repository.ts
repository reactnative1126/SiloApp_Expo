import {EntityRepository} from '@mikro-orm/postgresql';
import {BlockTx} from '../models/BlockTx';

export class BlockTxRepository extends EntityRepository<BlockTx> {
  async findByTxid(txid: string) {
    return await this.findOne({txid});
  }
}
