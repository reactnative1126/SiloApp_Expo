import {
  Cascade,
  Collection,
  Entity,
  FloatType,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property
} from "@mikro-orm/core";
import { Token } from "./Token";
import { Logger } from "@nestjs/common";
import { User } from "./User";
import { TransferStatus, TransferTargetType, USER_STATUS } from "../db.types";
import { TransferRepository } from "../repositories/transfer.repository";
import { SolanaAddress } from "./SolanaAddress";
import { Contact } from "./Contact";
import { PendingDebit } from "./PendingDebit";
import { PendingCredit } from "./PendingCredit";
import { TokenAccount } from "./TokenAccount";
import { BlockTx } from "./BlockTx";

const logger = new Logger('Transfer');

@Entity({ customRepository: () => TransferRepository })
export class Transfer {

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string", length: 20, nullable: false })
  targetType!: string;    // TransferTargetType

  // @Property({ type: "number"})
  // targetId!: number;

  @Property({ type: "string", length: 20, index: true, nullable: false, default: TransferStatus.CREATED })
  status!: string;

  @Property({ type: "date", nullable: false, index: true })
  createdAt: Date;

  @Property({ type: "date", nullable: true, index: true })
  processedAt: Date;

  @ManyToOne(() => User, { joinColumn: "from_user_id", nullable: false })
  fromUser: User;

  // @ManyToOne(() => User, { joinColumn: "created_by_id", nullable: false })
  // createdBy: User;

  @ManyToOne(() => TokenAccount, { nullable: false, joinColumn: 'from_tokenaccount_id' })
  fromTokenAccount: TokenAccount;

  @ManyToOne(() => TokenAccount, { nullable: false, joinColumn: 'to_tokenaccount_id' })
  toTokenAccount: TokenAccount;

  @Property({ type: FloatType, nullable: false, default: 0 })
  amount: number;

  // Pay Targets: which one is filled depends on the targetType
  @ManyToOne(() => User, { joinColumn: "to_user_id", nullable: true})
  toUser: User;

  @ManyToOne(() => Contact, { joinColumn: "contact_id", nullable: true})
  toContact: Contact;

  @ManyToOne(() => SolanaAddress, { joinColumn: "solanaaddress_id", nullable: true})
  toAddress: SolanaAddress;

  // @OneToOne(() => PendingDebit, { joinColumn: "pendingdebit_id"})
  // pendingDebit: PendingDebit;

  // @OneToOne(() => PendingDebit, { joinColumn: "pendingcredit_id"})
  // pendingCredit: PendingCredit;

  // the tx that processed this transfer
  @OneToOne(() => BlockTx, { joinColumn: "blocktx_id", nullable: true})
  blockTx: BlockTx;

  @Property({ nullable: true, type: "text" })
  error: string;

  constructor(fromUser: User, tokenAccount: TokenAccount, amount: number) {
    this.createdAt = new Date();
    this.status = TransferStatus.CREATED;
    this.fromUser = fromUser;
    this.amount = amount;
    this.fromTokenAccount = tokenAccount;
  }

  processing() {
    this.status = TransferStatus.PROCESSING;
  }

  processed(blockTx: BlockTx) {
    this.processedAt = blockTx.timestamp;
    this.status = TransferStatus.PROCESSED;
    this.blockTx = blockTx;
    // this.fromTokenAccount.processedPendingDebit(this.amount);

    // don't worry about pending credits for now
    // if (this.toTokenAccount) {
    //   this.toTokenAccount.processedPendingCredit(this.amount);
    // }

    // update PendingDebit
    // if (this.pendingDebit) {
    //   this.fromTokenAccount.processedPendingDebit(this.pendingDebit);
    //   this.pendingDebit.processed(blockTx);
    // }
  }

  setSolanaAddressTarget(solanaAddress: SolanaAddress) {
    this.toAddress = solanaAddress;
    this.targetType = TransferTargetType.SOLANA_ADDRESS;
  }

  setContactTarget(contact: Contact) {
    this.toContact = contact;
    this.targetType = TransferTargetType.CONTACT;
  }

  setUserTarget(rebelUser: User) {
    this.toUser = rebelUser;
    this.targetType = TransferTargetType.USER;
  }

  errored(error: string) {
    this.processedAt = new Date();
    this.error = error;
    this.status = TransferStatus.ERROR;
  }
}
