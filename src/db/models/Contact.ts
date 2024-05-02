import { BeforeCreate, Cascade, Entity, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { User } from "./User";
import { ContactRepository } from "../repositories/contact.repository";
import { Wallet } from "./Wallet";
import { CreateContactDto } from "../../api/dto/dto.types";
import { AddressType, ContactType } from "../db.types";
import { SolanaAddress } from "./SolanaAddress";

// a user's contact. at least one of the email, wallet, or rebelfiContact fields must be set

@Entity({ customRepository: () => ContactRepository })
@Unique({ properties: ["email", "user"] })
@Unique({ properties: ["user", "solanaAddress"] })
@Unique({ properties: ["user", "rebelfiContact"] })
export class Contact {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date;

  @Property({ type: "string", length: 255, nullable: false })
  name: string;

  @Property({ type: "string", length: 20, nullable: false })
  contactType: string;     // ContactType

  // normalized name for searching
  @Property({ type: "string", length: 255, nullable: false })
  nameNormal: string;

  // store email here in case the email a contact uses to register might be different
  @Property({ type: "string", length: 255, nullable: true})
  email: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => User, { joinColumn: "rebelficontact_user_id", nullable: true })
  rebelfiContact: User;

  @ManyToOne(() => SolanaAddress, { nullable: true, cascade: [Cascade.PERSIST, Cascade.MERGE]})
  solanaAddress: SolanaAddress;

  constructor(user: User, wallet?: SolanaAddress) {
    this.user = user;
    if (wallet) {
      this.setWalletContact(wallet);
    }
  }

  @BeforeCreate()
  beforeCreate() {
    this.createdAt = new Date();
    this.name = this.name.trim();
    this.nameNormal = this.name.toLowerCase();
  }

  update(contactInfo: CreateContactDto) {
    if (contactInfo.name) {
      this.name = contactInfo.name;
      this.nameNormal = this.name.toLowerCase();
    }
    if (contactInfo.email) {
      this.setEmailContact(contactInfo.email);
    }
    if (contactInfo.walletAddress && this.solanaAddress?.address !== contactInfo.walletAddress) {
      const wallet = new Wallet(contactInfo.walletAddress);
      this.setWalletContact(wallet);
    }
  }

  isRebelfiContact(): boolean {
    return !!this.rebelfiContact;
  }

  isWalletContact(): boolean {
    return !!this.solanaAddress && this.rebelfiContact === null;
  }

  isEmailContact(): boolean {
    return !!this.email && this.rebelfiContact === null;
  }

  setRebelfiContact(rebelfiContact: User) {
    if (this.contactType && this.contactType !== ContactType.USER) {
      throw new Error(`Contact already has a ${this.contactType} contact type. Cannot set rebelfi contact.`);
    }
    this.rebelfiContact = rebelfiContact;
    this.contactType = ContactType.USER;
  }

  setEmailContact(email: string) {
    if (this.contactType && this.contactType !== ContactType.EMAIL) {
      throw new Error(`Contact already has a ${this.contactType} contact type. Cannot set email contact.`);
    }
    this.email = email;
    this.contactType = ContactType.EMAIL;
  }

  setWalletContact(wallet: SolanaAddress) {
    if (this.contactType && this.contactType !== ContactType.WALLET) {
      throw new Error(`Contact already has a ${this.contactType} contact type. Cannot set wallet contact.`);
    }
    this.solanaAddress = wallet;
    this.contactType = ContactType.WALLET;
  }
}
