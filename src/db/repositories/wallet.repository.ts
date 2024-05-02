import {EntityRepository} from '@mikro-orm/postgresql';
import {Wallet} from '../models/Wallet';

export class WalletRepository extends EntityRepository<Wallet> {
  async findByAddress(walletAddress: string, options: any = {}): Promise<Wallet | null> {
    return await this.findOne({address: walletAddress}, options);
  }
}
