import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { TokenRepository } from "../repositories/token.repository";
import { PublicKey } from "@solana/web3.js";

@Entity({ customRepository: () => TokenRepository })
export class Token {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, nullable: false, index: true })
  mint!: string;

  @Property({ nullable: false, index: true })
  numDecimals!: number;

  // name + symbol are nullable because they are not available for all tokens (devnet and POSSIBLY some on mainnet)

  @Property({ nullable: true, index: true })
  name: string;

  @Property({ index: true, unique: true })
  symbol: string;

  @Property({ nullable: true })
  iconUrl: string;

  constructor(mint: string, numDecimals: number, name: string, symbol: string, iconUrl: string) {
    this.mint = mint;
    this.name = name;
    this.symbol = symbol;
    this.numDecimals = numDecimals;
    this.iconUrl = iconUrl;
  }

  publicKey() {
    return new PublicKey(this.mint);
  }
}
