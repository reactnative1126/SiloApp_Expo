import { EntityRepository } from "@mikro-orm/postgresql";
import { UserTx } from "../models/UserTx";
import { QueryOrder } from "@mikro-orm/core";

export class UserTxRepository extends EntityRepository<UserTx> {

  async findByUserId(userId: number) {
    return await this.find({ user: { id: userId } }, { orderBy: { blockTx: { timestamp: QueryOrder.DESC } } });
  }
}
