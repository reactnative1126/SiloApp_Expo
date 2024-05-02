import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL, ParsedTransactionWithMeta,
  PublicKey,
  SystemProgram,
  Transaction, TransactionInstruction,
  TransactionMessage, VersionedTransaction
} from "@solana/web3.js";
import { AnchorProvider, Instruction, Program } from "@project-serum/anchor";
import Bottleneck from "bottleneck";
import {
  createAssociatedTokenAccountInstruction, createCloseAccountInstruction,
  createTransferCheckedInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getMint,
  Mint
} from "@solana/spl-token";
import BN from "bn.js";
import { Logger } from "@nestjs/common";
import { isWithinPercentThreshold } from "../utils/misc";
import { sleep } from "../common/utils/js";


export interface SKey {
  key: PublicKey;
}

export interface SDomain {
  name: string;
  treasury: PublicKey;
  keyCost: BN;
  actionThreshold: number; // number of key approvals required to perform an action
}

export interface SKeychain {
  name: string;
  domain: string;
  numKeys: number;
  bump: number;
  keys: SKey[];
}

export interface AccountResponse<T> {
  pda: PublicKey;
  account?: T;
}

export interface STokenAccount {
  mint?: PublicKey; // mint == null means native SOL
  amount: number;
  decimals: number;
  amountUi: number;
  amountUiString: string;
  lamports: number;
  address: PublicKey;
}

export interface STokenAccountInfo {
  balance: number;
  decimals: number;
  ata: PublicKey;
}

// note: this class is used by both the frontend and backend; at some point it should be consolidated into a
//       common repository/package

export interface ISolanaClient {

  airdrop(publicKey: PublicKey, amountInSol: number);

  getMint(mint: PublicKey): Promise<Mint>;

  confirmTransaction(txid: string, commitment: Commitment): Promise<boolean>;

  getConnection(): Connection;

  getParsedTx(txid: string): Promise<ParsedTransactionWithMeta>;

  fetchTxForSync(txid: string): Promise<ParsedTransactionWithMeta>;
}

export class SolanaClient implements ISolanaClient {

  private readonly logger = new Logger(SolanaClient.name);

  private provider: AnchorProvider;
  private throttler: Bottleneck;

  private transferFeeCostLamports = null;

  constructor(provider: AnchorProvider, throttler: Bottleneck) {
    this.provider = provider;
    this.throttler = throttler;
  }

  async getMint(mint: PublicKey): Promise<Mint> {
    return await getMint(this.provider.connection, mint);
  }

  async airdrop(publicKey: PublicKey, amountInSol: number) {
    const txid = await this.provider.connection.requestAirdrop(publicKey, amountInSol * LAMPORTS_PER_SOL);
    await this.provider.connection.confirmTransaction(txid);
  }

  async confirmTransaction(txid: string, commitment: Commitment = "confirmed"): Promise<boolean> {
    console.log(`confirming txid: ${txid}`);
    const latestBlockHash = await this.provider.connection.getLatestBlockhash(commitment);
    const confirmed = await this.provider.connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
      },
      commitment
    );

    // no error means tx was successful
    return confirmed.value.err === null;
  }

  async sendTransaction(tx: any, signers: any[]): Promise<string> {
    return await this.provider.sendAndConfirm(tx, signers);
  }

  getConnection(): Connection {
    return this.provider.connection;
  }

  async sendSolIx(to: PublicKey, amountLamports: number, checkBalance: boolean = false): Promise<TransactionInstruction> {
    return SystemProgram.transfer({
      fromPubkey: this.provider.publicKey,
      toPubkey: to,
      lamports: amountLamports
    });
  }

  async sendSolTx(to: PublicKey, amountLamports: number, checkBalance: boolean = false): Promise<Transaction> {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.provider.publicKey,
        toPubkey: to,
        lamports: amountLamports
      })
    );
    if (checkBalance) {
      // if (!this.transferFeeCostLamports) {
      //   this.transferFeeCostLamports = await tx.getEstimatedFee(this.provider.connection);
      //   console.log(`Estimated SOL transfer cost: ${this.transferFeeCostLamports} lamports`);
      // }
      const balance = await this.provider.connection.getBalance(this.provider.publicKey);
      // if (balance - this.transferFeeCostLamports < amountLamports) {
      if (balance < amountLamports) {
        this.logger.error(`Cannot make transfer. Insufficient balance in ${this.provider.publicKey}: ${balance} < ${amountLamports}`);
        throw new Error(`Cannot make transfer. Insufficient balance in ${this.provider.publicKey}: ${balance} < ${amountLamports}`);
      }
    }
    return tx;
  }


  async sendSol(to: PublicKey, amountLamports: number, checkBalance: boolean = false, commitment: Commitment  = 'confirmed'): Promise<string> {
    const tx = await this.sendSolTx(to, amountLamports, checkBalance);
    return await this.provider.sendAndConfirm(tx, [], {commitment});
  }

  // creates a new tx object and checks to see if the given ata exists. if it doesn't, it adds an instruction to create it
  async createTransactionWithMissingAta(mint: PublicKey, newOwner: PublicKey, ata: PublicKey, signer?: Keypair) {
    const maybeMissingAccount = await this.provider.connection.getAccountInfo(ata);
    const tx: Transaction = new Transaction();
    if (!maybeMissingAccount) {
      this.logger.debug(
        `token account doesn't exist. adding create associated token account instruction to created tx for token account: ${ata.toBase58()}`
      );
      const txSigner = signer?.publicKey || this.provider.publicKey;
      tx.add(createAssociatedTokenAccountInstruction(txSigner, ata, newOwner, mint));
    } else {
      console.log("token account already exists. no need to create: ", ata.toBase58());
    }
    return tx;
  }

  async getTokenBalance(mint: PublicKey, wallet?: PublicKey): Promise<number> {
    const walletToUse = wallet || this.provider.publicKey;
    const ata = getAssociatedTokenAddressSync(mint, walletToUse, true);
    const balance = await this.provider.connection.getTokenAccountBalance(ata);
    return balance.value.uiAmount;
  }

  async getTokenAccountInfo(mint: PublicKey, wallet?: PublicKey): Promise<STokenAccountInfo> {
    const walletToUse = wallet || this.provider.publicKey;
    const ata = getAssociatedTokenAddressSync(mint, walletToUse, true);
    const balance = await this.provider.connection.getTokenAccountBalance(ata);
    return {
      balance: balance.value.uiAmount,
      decimals: balance.value.decimals,
      ata
    };
  }

  async getSolBalance(wallet?: PublicKey): Promise<number> {
    const walletToUse = wallet || this.provider.publicKey;
    const lamportsBalance = await this.provider.connection.getBalance(walletToUse);
    return lamportsBalance > 0 ? lamportsBalance / LAMPORTS_PER_SOL : 0;
  }

  async createVersionedTransaction(tx: Transaction, payer: PublicKey) {
    // for doing versioned trasactions - not supported by wallet adapter yet
    const messageV0 = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: (await this.provider.connection.getLatestBlockhash()).blockhash,
      instructions: tx.instructions,
    }).compileToLegacyMessage();
    return new VersionedTransaction(messageV0);
  }


  async sendTokens(fromWallet: PublicKey, toWallet: PublicKey, amountDecimal: number, mint: PublicKey, mintDecimals: number, checkBalance: boolean = true, signer?: Keypair) {
    const tx = new Transaction();
    const ixs = await this.sendTokensIxs(fromWallet, toWallet, amountDecimal, mint, mintDecimals, checkBalance);
    for (const ix of ixs) {
      tx.add(ix);
    }

    if (signer) {
      const versionedTx = await this.createVersionedTransaction(tx, signer.publicKey);
       versionedTx.sign([signer]);
       const txid = await this.provider.connection.sendTransaction(versionedTx);
      // const txid = await this.provider.connection.sendTransaction(tx, [signer]);
      await this.confirmTransaction(txid);
      return txid;
    } else {
      return await this.provider.sendAndConfirm(tx);
    }
  }

  // creates instructions to send tokens including ata creation if necessary
  async sendTokensIxs(fromWallet: PublicKey, toWallet: PublicKey, amountDecimal: number, mint: PublicKey, mintDecimals: number, checkBalance: boolean = true): Promise<Array<TransactionInstruction>> {
    const toAta = getAssociatedTokenAddressSync(mint, toWallet, true);
    // const fromAta = getAssociatedTokenAddressSync(mint, this.provider.publicKey, true);
    const fromAta = getAssociatedTokenAddressSync(mint, fromWallet, true);
    let amountToSend = amountDecimal;
    if (checkBalance) {
      const fromBalance = await this.provider.connection.getTokenAccountBalance(fromAta);
      if (fromBalance.value.uiAmount < amountDecimal) {
        // check threshold; todo: change this in the future as this is slightly a hack for now
        const withinThreshold = isWithinPercentThreshold(fromBalance.value.uiAmount, amountDecimal, 0.005);
        if (withinThreshold) {
          amountToSend = fromBalance.value.uiAmount;
        } else {
          this.logger.error(`Cannot make transfer. Insufficient balance of ${mint.toBase58()} in ${fromAta}: ${fromBalance.value.uiAmount} < ${amountDecimal}`);
          throw new Error(`Cannot make transfer. Insufficient balance of ${mint.toBase58()} in ${fromAta}: ${fromBalance.value.uiAmount} < ${amountDecimal}`);
        }
      }
    }
    const ixs: Array<TransactionInstruction> = [];
    const maybeMissingAccount = await this.provider.connection.getAccountInfo(toAta);
    if (!maybeMissingAccount) {
      this.logger.debug(
        `token account doesn't exist. adding create associated token account instruction to created tx for token account: ${toAta.toBase58()}`
      );
      ixs.push(createAssociatedTokenAccountInstruction(fromWallet, toAta, toWallet, mint));
    }

    // now add the transfer
    ixs.push(createTransferCheckedInstruction(fromAta, mint, toAta, fromWallet, amountToSend * 10 ** mintDecimals, mintDecimals));
    return ixs;
  }

  // send, DON"T confirm
  async sendTx(tx: Transaction, payer: PublicKey, signers: Keypair[]): Promise<string> {
    const versionedTx = await this.createVersionedTransaction(tx, payer);
    versionedTx.sign(signers);
    const estimatedFee = await this.provider.connection.getFeeForMessage(versionedTx.message);
    const lamportsBalance = await this.provider.connection.getBalance(payer);
    if (estimatedFee && estimatedFee.value > lamportsBalance) {
      throw new Error(`Insufficient funds to pay for the transaction. Need: ${estimatedFee.value} lamports, balance: ${lamportsBalance}`);
    }
    return await this.provider.connection.sendTransaction(versionedTx);
  }

  async sendAndConfirmTx(tx: Transaction, payer: PublicKey, signers: Keypair[], commitment: Commitment = 'confirmed'): Promise<string> {
    const txid = await this.sendTx(tx, payer, signers);
    await this.confirmTransaction(txid, commitment);
    // const txid = await this.provider.sendAndConfirm(tx, signers);
    return txid;
  }

  closeTokenAccountIx(ata: PublicKey, destination: PublicKey, authority: PublicKey) {
    return createCloseAccountInstruction(ata, destination, authority);
  }

  async drainLamports(from: PublicKey, to: PublicKey, signer: Keypair): Promise<string> {
    // first get the balance
    let lamportsToTransfer = await this.provider.connection.getBalance(from);
    // construct the transaction
    let tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: lamportsToTransfer
      })
    );
    // construct a versioned tx to calculate the fee
    const versionedTx = await this.createVersionedTransaction(tx, signer.publicKey);
    const estimatedFee = await this.provider.connection.getFeeForMessage(versionedTx.message);
    if (lamportsToTransfer > estimatedFee.value) {
      lamportsToTransfer = lamportsToTransfer - estimatedFee.value;
      tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: to,
          lamports: lamportsToTransfer
        })
      );
      return await this.sendAndConfirmTx(tx, from, [signer]);
    } else {
      this.logger.warn(`Insufficient funds to drain lamports from ${from.toBase58()}. Need: ${estimatedFee.value} lamports, balance: ${lamportsToTransfer}`);
    }
  }

  async getParsedTx(txid: string) {
    return await this.throttler.schedule(() => {
      return this.provider.connection.getParsedTransaction(txid, { maxSupportedTransactionVersion: 0 });
    });
  }

  async fetchTxForSync(txid: string): Promise<ParsedTransactionWithMeta> {
    let tx = await this.throttler.schedule(() => {
      return this.provider.connection.getParsedTransaction(txid, { maxSupportedTransactionVersion: 0 });
    });
    if (!tx) {
      // we'll try to confirm the
      this.logger.debug(`couldn't fetch tx: ${txid}, waiting for confirmation...`);
      const confirmed = await this.confirmTransaction(txid, "confirmed");
      if (confirmed) {
        this.logger.debug(`confirmed tx: ${txid}. fetching...`);
        tx = await this.throttler.schedule(() => {
          return this.provider.connection.getParsedTransaction(txid, { maxSupportedTransactionVersion: 0 });
        });
        this.logger.debug(`couldn't fetch CONFIRMED txid ${txid}. hack/waiting a bit longer...`);
        // if we STILL don't have the tx, then i blame the fucking rpc- so we'll try to wait a LITTLE, so this is essentially a hack for shitty rpc
        await sleep(1111);
        tx = await this.throttler.schedule(() => {
          return this.provider.connection.getParsedTransaction(txid, "confirmed");
        });
        if (tx) {
          this.logger.debug(`whew! managed to fetch txid ${txid}`);
        } else {
          this.logger.warn(`fuck, what the shit man... txid ${txid} not found after confirmed tx!!!!`);
          // if THIS happens then we should "stub" the listing/tx info
        }
      }
    }
    if (!tx) {
      this.logger.error(`couldn\'t fetch tx: ${txid}`);
      throw new Error(`couldn\'t fetch tx: ${txid}`);
    } else {
      return tx;
    }
  }

}
