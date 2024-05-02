import {Commitment, Connection, PublicKey, Transaction} from '@solana/web3.js';
import {WalletAdapter} from '@metaplex-foundation/js';

export interface RpcClient {
  get connection(): Connection;

  confirmTransaction(txid: string, commitment?: Commitment): Promise<boolean>;

  // implemented by the helius rpc client only
  transferCompressed(
    walletAdapter: WalletAdapter,
    assetId: PublicKey,
    fromAddress: PublicKey,
    toAddress: PublicKey,
  ): Promise<Transaction>;
}

