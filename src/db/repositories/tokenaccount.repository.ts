import { EntityRepository } from "@mikro-orm/postgresql";
import { Token } from "../models/Token";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { TokenAccount } from "../models/TokenAccount";

export class TokenAccountRepository extends EntityRepository<TokenAccount> {

  async findByTokenSymbol(userId: number, tokenSymbol: string): Promise<TokenAccount | null> {
    return this.findOne({ user: {id: userId}, token: {symbol: tokenSymbol}}, {populate: ['token']});
  }

  async getUsdcAccount(userId: number): Promise<TokenAccount | null> {
    return await this.findByTokenSymbol(userId, "USDC");
  }
}
