import {
  Cascade,
  Collection,
  Entity,
  FloatType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique
} from "@mikro-orm/core";
import { User } from "./User";
import { Token } from "./Token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { BlockTx } from "./BlockTx";
import { AccountTx } from "./AccountTx";
import { ACCOUNT_TX_ACTION_TYPE, ACCOUNT_TX_STATUS } from "../db.types";
import { Logger } from "@nestjs/common";
import { Currency } from "./Currency";
import { TokenAccountRepository } from "../repositories/tokenaccount.repository";

const TokenAccountLogger: Logger = new Logger("TokenAccount");


@Entity({ customRepository: () => TokenAccountRepository })
@Unique({ properties: ["user", "token"] })
export class TokenAccount {

  @PrimaryKey()
  id!: number;

  @Property({ type: FloatType, nullable: false, default: 0 })
  balance: number;

  @Property({ type: FloatType, nullable: false, default: 0 })
  unsyncedBalance: number;

  @Property({ nullable: false })
  ata: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Token, { nullable: false })
  token: Token;

  @ManyToOne(() => BlockTx, { name: "last_synced_blocktx_id", nullable: true })
  lastSyncedBlockTx: BlockTx;

  @OneToMany(() => AccountTx, (atx) => atx.tokenAccount, { orphanRemoval: true, cascade: [Cascade.ALL] })
  transactions = new Collection<AccountTx>(this);

  // @OneToMany(() => PendingCredit, (atx) => atx.tokenAccount, { orphanRemoval: true, cascade: [Cascade.ALL] })
  // pendingCredits = new Collection<PendingCredit>(this);
  //
  // @OneToMany(() => PendingDebit, (atx) => atx.tokenAccount, { orphanRemoval: true, cascade: [Cascade.ALL] })
  // pendingDebits = new Collection<PendingDebit>(this);

  constructor(user: User, token: Token) {
    this.balance = 0;
    this.unsyncedBalance = 0;
    this.user = user;
    this.token = token;
    this.ata = getAssociatedTokenAddressSync(new PublicKey(token.mint), new PublicKey(user.walletAddress), true).toBase58();
  }

  addAndSyncTransaction(tx: AccountTx, setLastSynced: boolean = true) {
    this.transactions.add(tx);
    this.syncTransaction(tx, setLastSynced);
  }

  syncedBlock(blockTx: BlockTx) {
    if (!blockTx) {
      // todo: this happens, need to figure out why and fix
      TokenAccountLogger.error(`syncedBlock called with empty blockTx!`);
    } else {
      this.lastSyncedBlockTx = blockTx;
    }
  }

  syncTransaction(tx: AccountTx, setLastSynced: boolean = true) {
    if (setLastSynced) {
      this.syncedBlock(tx.blockTx);
    }
    // calculate the balance adjustment
    const sign = Math.sign(this.unsyncedBalance) * Math.sign(tx.amount);
    if (sign < 0) {
      this.unsyncedBalance += tx.amount;
      const isCrossingZero = (this.unsyncedBalance > 0 && tx.amount > 0) || (this.unsyncedBalance < 0 && tx.amount < 0);
      if (isCrossingZero) {
        this.balance += this.unsyncedBalance;
        this.unsyncedBalance = 0;
      }
    } else {
      // just add to balance
      this.balance += tx.amount;
    }
    tx.synced();
  }

  addPendingDebit(amountDecimal: number, accountTxType: ACCOUNT_TX_ACTION_TYPE, counterpartyName: string, currency: Currency): AccountTx {
    this.balance -= amountDecimal;
    this.unsyncedBalance += amountDecimal;
    const acctTx = new AccountTx(accountTxType, null, this, -amountDecimal, counterpartyName, currency);
    this.transactions.add(acctTx);
    return acctTx;
  }

  addPendingCredit(amountDecimal: number, accountTxType: ACCOUNT_TX_ACTION_TYPE, counterpartyName: string, currency: Currency): AccountTx {
    this.balance += amountDecimal;
    this.unsyncedBalance -= amountDecimal;
    const acctTx = new AccountTx(accountTxType, null, this, amountDecimal, counterpartyName, currency);
    this.transactions.add(acctTx);
    return acctTx;
  }

  // debit and credit are the newer versions of addPendingCredit/Debit
  pendingDebit(amountDecimal: number) {
    this.balance -= amountDecimal;
    this.unsyncedBalance += amountDecimal;
    // const pendingDebit = new PendingDebit(amountDecimal, this);
    // this.pendingDebits.add(pendingDebit);
    // return pendingDebit;
  }

  pendingCredit(amountDecimal: number) {
    this.balance += amountDecimal;
    this.unsyncedBalance -= amountDecimal;
    // const pendingCredit = new PendingCredit(amountDecimal, this);
    // this.pendingCredits.add(pendingCredit);
    // return pendingCredit;
  }

  processedPendingDebit(amountDecimal: number) {
    this.unsyncedBalance -= amountDecimal;
    // this.pendingDebits.remove(pendingDebit);
    // return this;
  }

  processedPendingCredit(amountDecimal: number) {
    this.unsyncedBalance += amountDecimal;
    // this.pendingDebits.remove(pendingDebit);
    // return this;
  }

  hasBalance(amount: number) {
    return this.balance >= amount;
  }
}

