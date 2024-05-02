import { Cascade, Collection, Entity, FloatType, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Token } from "./Token";
import { Keypair } from "@solana/web3.js";
import { Logger } from "@nestjs/common";
import { createRandomToken } from "../../utils/misc";
import { User } from "./User";
import { PAYLINK_STATUS, USER_STATUS } from "../db.types";

const logger = new Logger('Paylink');

@Entity()
export class Paylink {

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "date", nullable: false, index: true })
  createdAt: Date;

  @Property({ type: "string", length: 20, index: true, nullable: false, default: PAYLINK_STATUS.CREATED })
  status!: string;

  @Property({ type: "date", nullable: true, index: true })
  claimedAt: Date;

  @Property({ type: "string", length: 255, unique: true, nullable: true })
  walletAddress: string;

  @Property({ type: "string", length: 255, unique: true, nullable: true })
  walletKeypair: string;

  @ManyToOne(() => User, { joinColumn: "created_by_id", nullable: false })
  createdBy: User;

  @ManyToOne(() => User, { joinColumn: "claimed_by_id", nullable: true })
  claimedBy: User;

  @ManyToOne(() => Token, { nullable: false })
  token: Token;

  @Property({ type: FloatType, nullable: false, default: 0 })
  amount: number;

  @Property({ type: "string", length: 255, nullable: false, unique: true, index: true })
  claimCode: string;

  constructor(createdBy: User, token: Token, amount: number) {
    this.createdAt = new Date();
    this.status = PAYLINK_STATUS.CREATED;
    this.createdBy = createdBy;
    this.amount = amount;
    this.token = token;
    this.claimCode = createRandomToken(`${this.createdBy.username}|${this.createdAt.toString()}|${this.amount}`);
    const keypair = new Keypair();
    const secret = Array.from(keypair.secretKey);
    this.walletAddress = keypair.publicKey.toBase58();
    this.walletKeypair = JSON.stringify(secret);
  }

  keypair(): Keypair {
    // const buff = bs58.decode(this.walletSecret);
    // return Keypair.fromSecretKey(new Uint8Array(buff));
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(this.walletKeypair)));
  }

  canDisburse(): boolean {
    return this.status === PAYLINK_STATUS.CLAIMED && this.claimedBy && this.claimedBy.status === USER_STATUS.ACTIVE;
  }

  funded() {
    this.status = PAYLINK_STATUS.FUNDED;
  }

  claim(claimedBy: User) {
    this.claimedBy = claimedBy;
    this.claimedAt = new Date();
    this.status = PAYLINK_STATUS.CLAIMED;
  }

}
