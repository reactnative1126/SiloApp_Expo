import {Entity, Enum, PrimaryKey, Property} from '@mikro-orm/core';
import {PublicKey} from '@solana/web3.js';
import {ADDRESS_TYPE} from '../db.types';
import { SolanaAddressRepository } from "../repositories/solanaaddress.repository";

@Entity({customRepository: () => SolanaAddressRepository})
export class SolanaAddress {

  @PrimaryKey()
  id!: number;

  @Property({nullable: false, unique: true, index: true})
  address!: string;

  // todo: this is better as a tag or something, since we can tag an address as being used for various purposes
  @Enum({items: () => ADDRESS_TYPE, nullable: false, index: true, default: ADDRESS_TYPE.UNKNOWN})
  type: ADDRESS_TYPE = ADDRESS_TYPE.UNKNOWN;

  constructor(address: string, type: ADDRESS_TYPE = ADDRESS_TYPE.UNKNOWN) {
    // make sure it's a valid address
    const pubkey = new PublicKey(address);
    this.address = address;
    this.type = type;
  }

  public publicKey(): PublicKey {
    return new PublicKey(this.address);
  }
}
