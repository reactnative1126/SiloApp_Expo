import { Entity, FloatType, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { User } from "./User";
import { BlockTx } from "./BlockTx";
import { TokenAccount } from "./TokenAccount";
import { ACCOUNT_TX_STATUS, ACCOUNT_TX_ACTION_TYPE, AccountTxType } from "../db.types";
import { Logger } from "@nestjs/common";
import { CurrencyAmount } from "./CurrencyAmount";
import { Currency } from "./Currency";
import { Action } from "./Action";

const AccountTxLogger: Logger = new Logger("AccountTx");

@Entity()
export class AccountTx {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date;

  // todo: make nullable false after db updated
  @Property({ nullable: true, length: 20, index: true, default: ACCOUNT_TX_STATUS.CREATED })
  status: string;

  @ManyToOne(() => BlockTx, { nullable: true })
  blockTx: BlockTx;

  @Property({ nullable: false })
  actionType!: string;         // FUNDING, DEPOSIT, PAYMENT, RECEIPT

  @Property({ nullable: false })
  txType!: string;         // CREDIT or DEBIT

  // +/- depending on credit/debit
  @Property({ type: FloatType, nullable: false, default: 0 })
  amount: number;

  @ManyToOne(() => CurrencyAmount, { nullable: false })
  currencyAmount: CurrencyAmount;

  @Property({ nullable: false })  // 'UNKNOWN' if coming from a random wallet
  counterpartyName: string;

  @ManyToOne(() => User, {nullable: true})
  counterpartyUser: User;

  // wallet address. for unknown deposit/payment
  @Property({ nullable: true, index: true })
  counterpartyAddress: string;

  @ManyToOne(() => TokenAccount, { nullable: false })
  tokenAccount: TokenAccount;

  // if this was created as part of an action
  @ManyToOne(() => Action, { nullable: true })
  action: Action;

  constructor(actionType: string, blockTx: BlockTx, tokenAccount: TokenAccount, amount: number, counterpartyName: string, currency: Currency) {
    this.counterpartyName = counterpartyName;
    this.blockTx = blockTx;
    this.actionType = actionType;
    switch (actionType) {
      case ACCOUNT_TX_ACTION_TYPE.FUNDING:
      case ACCOUNT_TX_ACTION_TYPE.RECEIPT:
      case ACCOUNT_TX_ACTION_TYPE.DEPOSIT:
        this.txType = AccountTxType.CREDIT;
        break;
      case ACCOUNT_TX_ACTION_TYPE.PAYMENT:
      case ACCOUNT_TX_ACTION_TYPE.WITHDRAWAL:
        this.txType = AccountTxType.DEBIT;
        break;
      default:
        throw new Error(`Unknown AccountTx action type: ${actionType}`);
    }
    this.createdAt = new Date();
    this.amount = amount;
    this.tokenAccount = tokenAccount;
    this.currencyAmount = new CurrencyAmount(amount, currency);
    if (actionType === ACCOUNT_TX_ACTION_TYPE.PAYMENT || actionType === ACCOUNT_TX_ACTION_TYPE.WITHDRAWAL) {
      if (amount > 0) {
        throw new Error("payment or withdrawal tx amount must be negative");
      }
    } else if (actionType === ACCOUNT_TX_ACTION_TYPE.DEPOSIT || actionType === ACCOUNT_TX_ACTION_TYPE.RECEIPT) {
      if (amount < 0) {
        throw new Error("deposit or receipt tx amount must be positive");
      }
    }
  }

  setCounterparty(name: string, address: string) {
    this.counterpartyName = name;
    this.counterpartyAddress = address;
  }

  withCounterparty(counterpartyUser: User) {
    const name = counterpartyUser.getName();
    this.setCounterparty(name, counterpartyUser.walletAddress);
    this.counterpartyUser = counterpartyUser;
  }

  submitted() {
    this.status = ACCOUNT_TX_STATUS.SUBMITTED;
  }

  sync(blockTx: BlockTx) {
    this.blockTx = blockTx;
    // debug
    if (this.status !== ACCOUNT_TX_STATUS.SUBMITTED) {
      AccountTxLogger.warn(`unexpected status ${this.status} for tx ${this.id} when syncing. expected SUBMITTED.`);
    }
    if (this.status !== ACCOUNT_TX_STATUS.SYNCED) {
      this.tokenAccount.syncTransaction(this, true);
    }
  }

  synced() {
    this.status = ACCOUNT_TX_STATUS.SYNCED;
  }

  isDebit(): boolean {
    return this.amount < 0;
  }

  isCredit(): boolean {
    return this.amount > 0;
  }
}


