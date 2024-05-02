import { Cascade, Entity, Enum, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { WalletRepository } from "../repositories/wallet.repository";
import { PublicKey } from "@solana/web3.js";
import { ADDRESS_TYPE } from "../db.types";
import { SolanaAddress } from "./SolanaAddress";

@Entity({customRepository: () => WalletRepository})
export class Wallet {
  @PrimaryKey()
  id!: number;

  @Property({nullable: false, unique: true, index: true})
  address!: string;

  @OneToOne(() => SolanaAddress, {joinColumn: 'solanaaddress_id', nullable: false, index: true, unique: true, cascade: [Cascade.MERGE, Cascade.PERSIST]})
  solanaAddress: SolanaAddress;

  // for wallets tied to paylink, emailwallet, etc (todo: nullable: false
  @Property({ type: "string", length: 255, unique: true, nullable: true })
  walletKeypair: string;

  // todo: this is better as a tag or something, since we can tag an address as being used for various purposes
  @Enum({items: () => ADDRESS_TYPE, nullable: false, index: true, default: ADDRESS_TYPE.UNKNOWN})
  type: ADDRESS_TYPE = ADDRESS_TYPE.UNKNOWN;

  constructor(address: string, type: ADDRESS_TYPE = ADDRESS_TYPE.UNKNOWN) {
    const pubkey = new PublicKey(address);
    this.address = address;
    this.type = type;
  }

  public publicKey(): PublicKey {
    return new PublicKey(this.address);
  }
}
