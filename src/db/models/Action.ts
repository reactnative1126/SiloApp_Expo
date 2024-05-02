import { Cascade, Collection, Entity, FloatType, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";
import { BlockTx } from "./BlockTx";
import { ACTION_STATUS, ACTION_TARGET_TYPE, ACTION_TYPE } from "../db.types";
import { Chat } from "./Chat";
import { Logger } from "@nestjs/common";
import { AccountTx } from "./AccountTx";
import { RebelTx } from "./RebelTx";


const ActionLogger: Logger = new Logger("Action");

@Entity()
export class Action {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date = new Date();

  @Property({ nullable: true, index: true })
  processAfter: Date = new Date();

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Property({ nullable: false, length: 255, index: true })
  target: string;

  @Property({ nullable: false, length: 20, index: true })
  targetType: string;

  // todo: needs to change to several transactions per action (e.g. receipt + lending deposit)
  // txid gets populated when action processed
  @Property({ length: 255, unique: true, index: true, nullable: true })
  txid: string;

  // blockTx gets populated when the tx is found during sync
  @ManyToOne(() => BlockTx, { nullable: true, name: "blocktx_id" })
  blockTx: BlockTx;

  // the chat this action was created under (if user-initiated)
  @ManyToOne(() => Chat, { nullable: true })
  chat: Chat;

  @Property({ nullable: false, length: 20, index: true })
  actionType: string;

  @Property({ nullable: false, length: 20, index: true, default: ACTION_STATUS.CREATED })
  status: string;

  @Property({ name: "params", type: "json", nullable: true })
  params: object = {};

  // pull these out of params for easy querying
  @Property({ type: FloatType, index: true, nullable: true })
  amount: number;

  @ManyToOne(() => User, { nullable: true })
  targetUser: User;

  @OneToMany(() => AccountTx, (atx) => atx.action, { cascade: [Cascade.MERGE, Cascade.PERSIST] })
  accountTransactions = new Collection<AccountTx>(this);

  @OneToMany(() => RebelTx, (rt) => rt.action, { cascade: [Cascade.MERGE, Cascade.PERSIST] })
  rebelTransactions = new Collection<RebelTx>(this);

  @Property({ nullable: true, type: "text" })
  error: string;

  constructor(initiator: User, target: string, targetType: string, actionType: string) {
    this.user = initiator;
    this.target = target;
    this.targetType = targetType;
    this.actionType = actionType;
  }

  confirmed() {
    this.status = ACTION_STATUS.CONFIRMED;
  }

  sync(blockTx: BlockTx) {
    this.blockTx = blockTx;
    if (this.status !== ACTION_STATUS.PROCESSED) {
      ActionLogger.warn(`Action ${this.id} is not processed yet. current status: ${this.status}. cautiously setting to synced...`);
    }
    this.status = ACTION_STATUS.SYNCED;
    for (const tx of this.accountTransactions) {
      tx.sync(blockTx);
    }
  }

  submittedTx(txid: string) {
    this.txid = txid;
    for (const tx of this.accountTransactions) {
      tx.submitted();
    }
    this.addRebelTransaction(txid);
  }

  getCreditTransaction(): AccountTx | null {
    for (const tx of this.accountTransactions) {
      if (tx.isCredit()) {
        return tx;
      }
    }
    return null;
  }

  getDebitTransaction(): AccountTx | null {
    for (const tx of this.accountTransactions) {
      if (tx.isDebit()) {
        return tx;
      }
    }
    return null;
  }

  addRebelTransaction(txid: string) {
    const rebelTx = new RebelTx(txid, this);
    this.rebelTransactions.add(rebelTx);
  }

  static createPaymentAction(initiator: User, tokenSymbol: string, amount: number, target: string, targetType: ACTION_TARGET_TYPE) {
    const action = new Action(initiator, target, targetType, ACTION_TYPE.PAYMENT);
    action.params = {
      tokenSymbol,
      amountDecimal: amount,
    }
    return action;
  }
}


