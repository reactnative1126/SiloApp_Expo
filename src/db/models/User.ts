import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { UserRepository } from "../repositories/user.repository";
import { TokenAccount } from "./TokenAccount";
import { Token } from "./Token";
import { Action } from "./Action";
import { UserTx } from "./UserTx";
import { Keypair, PublicKey } from "@solana/web3.js";
import { ACCOUNT_TX_ACTION_TYPE, TX_STATUS, USER_ROLE, USER_STATUS } from "../db.types";
import { Logger } from "@nestjs/common";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Contact } from "./Contact";
import { AccountTx } from "./AccountTx";
import { createRandomNumericString, createRandomToken } from "../../utils/misc";
import { Currency } from "./Currency";
import { FriendlyException } from "../../api/controller/exception/friendly.exception";
import { UpdateUserDto } from "../../api/dto/dto.types";

const logger = new Logger("User");

@Entity({ tableName: "users", customRepository: () => UserRepository })
export class User {

  @PrimaryKey({ type: "number" })
  id!: number;

  // todo: make this non-nullable later after creating an Invite entity
  @Property({ type: "string", length: 255, nullable: true })
  password: string;

  @Property({ type: "string", length: 50, nullable: false, unique: true })
  username!: string;

  @Property({ type: "string", length: 100, nullable: false })
  name!: string;

  @Property({ type: "string", length: 50, nullable: false })
  firstName!: string;

  @Property({ type: "string", length: 50, nullable: false })
  lastName!: string;

  @Property({ type: "string", length: 100, nullable: false })
  nameNormal!: string;

  @Property({ type: "string", length: 255, unique: true, nullable: false })
  email!: string;

  @Property({ type: "string", length: 12, unique: false, nullable: false })
  pin!: string;

  @Property({ type: "string", length: 255, unique: true, nullable: false })
  emailConfirmationCode!: string;

  @Property({ nullable: false, default: false })
  emailConfirmed!: boolean;

  @Property({ type: "string", length: 255, nullable: true, unique: true })
  authToken: string;

  @Property({ type: "string", length: 255, nullable: true, unique: true })
  passwordResetToken: string;

  @Property({ type: "string", length: 20, nullable: false, default: USER_ROLE.USER })
  role!: string;

  @Property({ type: "string", length: 20, index: true, nullable: false, default: USER_STATUS.REGISTERED })
  status!: string;

  @Property({ type: "date", nullable: true, index: true })
  registeredAt: Date;

  @Property({ type: "date", nullable: true, index: true })
  activatedAt: Date;

  @Property({ type: "string", length: 20, nullable: true, unique: true })
  phone: string;

  @Property({ type: "date", nullable: true, index: true })
  phoneVerifiedAt: Date;

  @Property({ type: "date", nullable: true, index: true })
  phoneVerifyAttemptedAt: Date;

  @Property({ type: "string", length: 255, unique: true, nullable: true })
  walletAddress: string;

  // additional wallet transaction password (not used for now)
  @Property({ type: "string", length: 255, nullable: true })
  walletPhrase: string;

  @Property({ type: "string", length: 255, unique: true, nullable: true })
  walletKeypair: string;

  // @Property({ type: "string", length: 255, unique: true, nullable: true })
  // walletSecret: string;

  @Property({ nullable: false, default: false })
  walletInitialized: boolean;

  @OneToMany(() => TokenAccount, (tb) => tb.user, { orphanRemoval: true, cascade: [Cascade.ALL] })
  accounts = new Collection<TokenAccount>(this);

  @OneToMany(() => Action, (action) => action.user, { orphanRemoval: true, cascade: [Cascade.ALL] })
  actions = new Collection<Action>(this);

  @OneToMany(() => UserTx, (ut) => ut.user, { orphanRemoval: true, cascade: [Cascade.ALL] })
  transactions = new Collection<UserTx>(this);

  @OneToMany(() => Contact, (c) => c.user, { orphanRemoval: true, cascade: [Cascade.ALL] })
  contacts = new Collection<Contact>(this);

  @ManyToOne(() => User, { joinColumn: "invited_by_id", nullable: true })
  invitedBy: User;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @Property({ type: "string", length: 255, nullable: true })
  profileImage: string;

  @Property({ nullable: false, default: true })
  emailNotifications: boolean;

  @Property({ nullable: false, default: true })
  pushNotifications: boolean;

  constructor(email: string, username: string, firstName: string, lastName: string, currency: Currency) {
    this.name = firstName + ' ' + lastName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email.toLowerCase().trim();
    this.username = username.toLowerCase().trim();
    this.currency = currency;
    this.emailConfirmationCode = createRandomNumericString(6);
    // todo: fix this later w/updated registration
    this.nameNormal = this.name.toLowerCase();
    this.initUser();
    // todo: this should get added to signup process
    this.pin = '000000';
  }

  initUser() {
    if (!this.walletAddress) {
      const keypair = new Keypair();
      const secret = Array.from(keypair.secretKey);
      this.walletAddress = keypair.publicKey.toBase58();
      this.walletKeypair = JSON.stringify(secret);
      this.role = USER_ROLE.USER;
    }
    // this.walletSecret = bs58.encode(secret);
  }

  registered() {
    this.registeredAt = new Date();
    this.status = USER_STATUS.REGISTERED;
  }

  activate() {
    this.initUser();
    this.activatedAt = new Date();
    this.status = USER_STATUS.ACTIVE;
  }

  inviteBy(inviter: User) {
    this.invitedBy = inviter;
    this.status = USER_STATUS.INVITED;
  }

  keypair(): Keypair {
    if (!this.walletKeypair) {
      logger.error(`user ${this.id} has no wallet keypair. role: ${this.role}`);
      throw new Error(`user ${this.id} has no wallet key`);
    }
    // const buff = bs58.decode(this.walletSecret);
    // return Keypair.fromSecretKey(new Uint8Array(buff));
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(this.walletKeypair)));
  }

  publicKey(): PublicKey {
    return new PublicKey(this.walletAddress);
  }

  getTokenAccount(token: Token, createIfMissing: boolean = false): TokenAccount | null {
    // find the token balance if it exists
    for (let i = 0; i < this.accounts.length; i++) {
      const tb = this.accounts[i];
      if (tb.token.mint === token.mint) {
        return tb;
      }
    }
    if (createIfMissing) {
      const tokenAccount = new TokenAccount(this, token);
      this.accounts.add(tokenAccount);
      return tokenAccount;
    } else {
      return null;
    }
  }

  setBalance(token: Token, amount: number) {
    let tokenAccount = this.getTokenAccount(token, true);
    tokenAccount.balance = amount;
  }

  addPendingDebit(token: Token, amountDecimal: number, accountTxType: ACCOUNT_TX_ACTION_TYPE, counterpartyName: string, currency: Currency): AccountTx {
    let tokenAccount = this.getTokenAccount(token);
    return tokenAccount.addPendingDebit(amountDecimal, accountTxType, counterpartyName, currency);
  }

  addPendingCredit(token: Token, amountDecimal: number, accountTxType: ACCOUNT_TX_ACTION_TYPE, counterpartyName: string, currency: Currency, createIfMissing: boolean = false): AccountTx {
    let tokenAccount = this.getTokenAccount(token, createIfMissing);
    return tokenAccount.addPendingCredit(amountDecimal, accountTxType, counterpartyName, currency);
  }

  getName() {
    return this.name;
  }

  isSystem() {
    return this.role === USER_ROLE.SYSTEM;
  }

  addRebelfiContact(rebelfiContact: User): Contact {
    const c = new Contact(this);
    c.setRebelfiContact(rebelfiContact);
    this.contacts.add(c);
    return c;
  }

  addContact(contact: Contact) {
    this.contacts.add(contact);
    contact.user = this;
  }

  genAuthToken(): string {
    this.authToken = createRandomToken(`${this.username}|${new Date().toString()}`);
    return this.authToken;
  }

  // this is the last step. when email is confirmed then activate the user
  confirmedEmail() {
    this.emailConfirmed = true;
    this.activate();
  }

  logout() {
    this.authToken = null;
  }

  getTokenAccountForSymbol(tokenSymbol: string) {
    const tokenAccount = this.accounts.getItems().find((ta) => ta.token.symbol === tokenSymbol);
    if (!tokenAccount) {
      throw new Error(`User ${this.id} doesn't have a TokenAccount for ${tokenSymbol}`);
    }
    return tokenAccount;
  }

  setPin(pin: string) {
    // shouldn't happen cause fe validation
    if (pin.length !== 6) throw new FriendlyException('Pin must be 6 digits.');
    // make sure only numeric pin
    if (!/^\d+$/.test(pin)) throw new FriendlyException('Pin must be numeric.');
    this.pin = pin;
  }

  setNotifications(email: boolean, push: boolean) {
    this.emailNotifications = email;
    this.pushNotifications = push;
  }
}
