import { Entity, FloatType, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { TokenAccount } from "./TokenAccount";

@Entity()
export class PendingCredit {

  @PrimaryKey()
  id!: number;

  @Property({ type: FloatType, nullable: false, default: 0 })
  amount: number;

  @ManyToOne(() => TokenAccount, { nullable: false })
  tokenAccount: TokenAccount;

  constructor(amount: number, tokenAccount: TokenAccount) {
    this.amount = amount;
    this.tokenAccount = tokenAccount;
  }
}
