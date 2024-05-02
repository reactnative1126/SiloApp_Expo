import { Commitment, Connection, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import {
  AccountResponse,
  ISolanaClient,
  SDomain,
  SKeychain
} from "../solanaclient";
import { Program } from "@project-serum/anchor";
import { Mint } from "@solana/spl-token";

export class SolanaClientMock implements ISolanaClient {

  constructor() {
  }

  // pull the keychain account for a given wallet address (if it exists)
  async getKeychainByKeyWallet(walletAddress: PublicKey): Promise<AccountResponse<SKeychain>> {
    // TODO: implement if needed
    throw new Error("not implemented");
  }

  async airdrop(publicKey: PublicKey, amountInSol: number) {
  }

  async getMint(mint: PublicKey): Promise<Mint> {
    return null;
  }

  async confirmTransaction(txid: string, commitment: Commitment = "confirmed"): Promise<boolean> {
    return true;
  }

  getConnection(): Connection {
    return null;
  }

  getParsedTx(txid: string): Promise<ParsedTransactionWithMeta> {
    return null;
  }

  fetchTxForSync(txid: string): Promise<ParsedTransactionWithMeta> {
    return null;
  }
}
