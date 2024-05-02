//Web3
import {Commitment, PublicKey, Transaction} from '@solana/web3.js';
import {web3} from '@project-serum/anchor';

//Util
import {
  Metaplex,
  Mint,
  Nft,
  NftEdition,
  Pda,
  WalletAdapter,
} from '@metaplex-foundation/js';

import {RpcClient} from '../solana.types';

export class StandardRpcClient implements RpcClient {
  protected conn: web3.Connection;
  protected metaplex: Metaplex;

  // todo: connection into constructor
  constructor(connection: web3.Connection) {
    this.conn = connection;
    this.metaplex = new Metaplex(connection);
  }

  get connection(): web3.Connection {
    return this.conn;
  }

  async confirmTransaction(txid: string, commitment: Commitment = 'confirmed'): Promise<boolean> {
    console.log(`confirming txid: ${txid}`);
    const latestBlockHash = await this.conn.getLatestBlockhash(commitment);
    const confirmed = await this.conn.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid,
      },
      commitment,
    );

    // no error means tx was successful
    return confirmed.value.err === null;
  }

  async transferCompressed(
    walletAdapter: WalletAdapter,
    assetId: PublicKey,
    fromAddress: PublicKey,
    toAddress: PublicKey,
  ): Promise<Transaction> {
    throw Error('not implemented');
  }
}
