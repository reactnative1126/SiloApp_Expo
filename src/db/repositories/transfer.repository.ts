import { EntityRepository } from "@mikro-orm/postgresql";
import { Transfer } from "../models/Transfer";

export class TransferRepository extends EntityRepository<Transfer> {

  async findById(id: number): Promise<Transfer> {
    return this.findOne({ id }, { populate: ['fromUser', 'fromTokenAccount.token', 'toContact', 'toUser', 'toAddress']});
  }

}
