import {EntityRepository} from '@mikro-orm/postgresql';
import { SolanaAddress } from '../models/SolanaAddress';

export class SolanaAddressRepository extends EntityRepository<SolanaAddress> {
  async findByAddress(walletAddress: string, options: any = {}): Promise<SolanaAddress | null> {
    return await this.findOne({address: walletAddress}, options);
  }
}
