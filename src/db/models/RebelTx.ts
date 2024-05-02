import { Entity, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { Action } from "./Action";
import { Logger } from "@nestjs/common";
import { Transfer } from "./Transfer";

const RebelTxLogger: Logger = new Logger("RebelTx");

// just a quick n dirty tx holder so we keep track of every tx we initiated
@Entity()
export class RebelTx {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date;

  @Property({ unique: true, index: true })
  txid!: string;

  // if this was created as part of an action
  @ManyToOne(() => Action, { nullable: true })
  action: Action;

  // if this was from a transfer
  @ManyToOne(() => Transfer, { nullable: true })
  transfer: Transfer;

  constructor(txid: string, action: Action = null) {
    this.txid = txid;
    this.action = action;
    this.createdAt = new Date();
  }

}


