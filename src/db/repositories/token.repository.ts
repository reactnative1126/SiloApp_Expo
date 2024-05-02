import { EntityRepository } from "@mikro-orm/postgresql";
import { Token } from "../models/Token";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export class TokenRepository extends EntityRepository<Token> {
  async getNativeMint(): Promise<Token> {
    return this.findOne({ mint: NATIVE_MINT.toBase58() });
  }

  async findByMint(mint: PublicKey): Promise<Token | null> {
    return this.findOne({ mint: mint.toBase58() });
  }

  async findBySymbol(symbol: string): Promise<Token> {
    return this.findOneOrFail({ symbol });
  }
}
