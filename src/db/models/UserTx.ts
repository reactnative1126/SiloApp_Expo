import { Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { User } from "./User";
import { BlockTx } from "./BlockTx";
import { UserTxRepository } from "../repositories/usertx.repository";

// maps a user to a block tx
@Entity({ tableName: "usertx", customRepository: () => UserTxRepository })
export class UserTx {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => BlockTx, { nullable: false })
  blockTx: BlockTx;

  constructor(user: User, blockTx: BlockTx) {
    this.user = user;
    this.blockTx = blockTx;
  }

}
