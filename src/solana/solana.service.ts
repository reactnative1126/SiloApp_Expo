import { Injectable, Logger } from "@nestjs/common";
import { BN, web3 } from "@project-serum/anchor";
import { FactoryService } from "../common/service/factory.service";
import { Commitment, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { SolanaClient } from "./solanaclient";
import { SplTokenSync } from "./sync/spltoken.sync";
import { UseRequestContext } from "@mikro-orm/core";
import { getMint } from "@solana/spl-token";
import { SolendAction } from "@solendprotocol/solend-sdk/index";
import { usd } from "@metaplex-foundation/js";
import * as assert from "assert";


@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);

  private systemKeypair: Keypair;
  private systemSolanaClient: SolanaClient;
  private usdcMint: PublicKey;
  private usdcMintDecimals: number;

  constructor(private readonly factoryService: FactoryService,
              private readonly splTokenSync: SplTokenSync) {
    this.systemKeypair = this.factoryService.getSystemSigner();
    this.systemSolanaClient = this.factoryService.solanaClient(this.systemKeypair);
    this.usdcMint = this.factoryService.getUsdcMint();
  }

  async onModuleInit() {
    this.logger.debug("Initializing SolanaService.... getting mint info for " + this.usdcMint.toBase58());
    // const mintInfo = await this.systemSolanaClient.getMint(this.usdcMint);
    const mintInfo = await getMint(this.systemSolanaClient.getConnection(), this.usdcMint);
    this.logger.debug("Initializing SolanaService...");
    this.usdcMintDecimals = mintInfo.decimals;
    this.logger.debug(`USDC Mint Decimals: ${this.usdcMintDecimals}`);
    const usdcBalance = await this.systemSolanaClient.getTokenBalance(this.usdcMint);
    this.logger.debug("Initializing SolanaService...");
    this.logger.debug(`system USDC Balance: ${usdcBalance}`);
    const solBalance = await this.systemSolanaClient.getSolBalance();
    this.logger.debug("Initializing SolanaService...");
    this.logger.debug(`system SOL Balance: ${solBalance}`);

    // make sure usdc is in the db
    await this.splTokenSync.syncTokenMint(this.usdcMint, "USD Coin", "USDC", "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", false);

    this.logger.debug("SolanaService Initialized...");
  }

  // send sol to a wallet
  async sendSol(to: PublicKey, amountDecimal: number, checkBalance: boolean = true, commitment: Commitment = 'confirmed') {
    const amount = web3.LAMPORTS_PER_SOL * amountDecimal;
    const txid = await this.systemSolanaClient.sendSol(to, amount, true, 'finalized');
    this.logger.debug(`Sent ${amountDecimal} sol to ${to.toBase58()} txid: ${txid}`);
    return txid;
  }

  async sendSolTx(to: PublicKey, amountDecimal: number) {
    const amountLamports = web3.LAMPORTS_PER_SOL * amountDecimal;
    return await this.systemSolanaClient.sendSolTx(to, amountLamports, true);
  }

  // send usdc to wallet
  async sendUsdc(fromWallet: PublicKey, toWallet: PublicKey, amountDecimal: number, signer?: Keypair) {
    return await this.sendTokens(this.usdcMint, fromWallet, toWallet, amountDecimal, signer);
  }

  // send usdc to wallet
  async sendTokens(mint: PublicKey, fromWallet: PublicKey, toWallet: PublicKey, amountDecimal: number, signer?: Keypair) {
    // todo: check sender wallet for enough tx fee funds
    const txid = await this.systemSolanaClient.sendTokens(fromWallet, toWallet, amountDecimal, mint, this.usdcMintDecimals, true, signer);
    this.logger.debug(`Sent ${amountDecimal} usdc to ${toWallet.toBase58()} txid: ${txid}`);
    return txid;
  }

  async createSendTokensIxs(mint: PublicKey, fromWallet: PublicKey, toWallet: PublicKey, amountDecimal: number, checkBalance: boolean = true) {
    return await this.systemSolanaClient.sendTokensIxs(fromWallet, toWallet, amountDecimal, mint, this.usdcMintDecimals, checkBalance);
  }

  // for now just assume usdc
  async createLendingDepositIxs(usdcMint: PublicKey, depositor: PublicKey, amountDecimals: number): Promise<Array<TransactionInstruction>> {
    const usdcReserve = this.factoryService.getSolendUsdcReserve();
    const usdcDecimals = usdcReserve.config.liquidityToken.decimals;
    const bnAmount = new BN(amountDecimals * 10 ** usdcDecimals);
    let solendAction = await SolendAction.buildDepositTxns(
      this.systemSolanaClient.getConnection(),
      bnAmount,
      "USDC",
      depositor,
      this.factoryService.getSolendEnv()
    );
    const ixs: Array<TransactionInstruction> = [];
    let {preLendingTxn, lendingTxn, postLendingTxn} = await solendAction.getTransactions();
    let txid = null;
    if (preLendingTxn) {
      // shouldn't be anything here but todo: perform the transaction if we encounter it
      this.logger.warn(`---- unexpected lending preLendingTxn tx: `, preLendingTxn);
      // txid = await provider.sendAndConfirm(preLendingTxn);
      console.log(`---- sol lending preLendingTxn txid: `, txid);
    }
    if (lendingTxn) {
      // this SHOULD be populated
      for (const ix of lendingTxn.instructions) {
        ixs.push(ix);
      }
    }
    if (postLendingTxn) {
      // shouldn't be anything here
      this.logger.warn(`---- unexpected lending postLendingTxn tx: `, postLendingTxn);
    }
    return ixs;
  }

  async getLendingDepositAmount(depositor: PublicKey): Promise<number> {
    const solendMarket = this.factoryService.getSolendMarket();
    const obligation = await solendMarket.fetchObligationByWallet(depositor);
    console.log(`fetched depsitor obligation: ${depositor.toBase58()}: `, obligation);
    const usdcReserve = this.factoryService.getSolendUsdcReserve();

    if (!obligation) {
      throw new Error(`No savings account found for depositor: ${depositor.toBase58()}`);
    }

    // find the deposit
    const deposit = obligation.deposits.find((deposit) => {
      return deposit.mintAddress === this.usdcMint.toBase58();
    });

    if (!deposit) {
      throw new Error(`No savings account found for depositor: ${depositor.toBase58()}`);
    } else {
      const depositAmount = deposit.amount.toNumber() / (10 ** this.usdcMintDecimals);
      console.log(`found deposit amount of: ${depositAmount} USDC`);
      return depositAmount;
    }
  }

  async createLendingWithdrawIxs(mint: PublicKey, depositor: PublicKey, amountDecimals: number): Promise<Array<TransactionInstruction>> {
    // first check deposit
    const solendMarket = this.factoryService.getSolendMarket();
    const obligation = await solendMarket.fetchObligationByWallet(depositor);
    console.log(`fetched depsitor obligation: ${depositor.toBase58()}: `, obligation);
    const usdcReserve = this.factoryService.getSolendUsdcReserve();

    if (!mint.equals(this.usdcMint)) {
      throw new Error('Only handling usdc for now');
    }

    const usdcDecimals = usdcReserve.config.liquidityToken.decimals;

    if (!obligation) {
      throw new Error(`No savings account found for depositor: ${depositor.toBase58()}`);
    }

    // find the deposit
    const deposit = obligation.deposits.find((deposit) => {
      return deposit.mintAddress === mint.toBase58();
    });

    if (!deposit) {
      throw new Error(`No savings account found for depositor: ${depositor.toBase58()}`);
    } else {
      const depositAmount = deposit.amount.toNumber() / (10 ** usdcDecimals);
      console.log(`found deposit amount of: ${depositAmount} USDC`);
      if (depositAmount < amountDecimals) {
        throw new Error(`cannot withdraw ${amountDecimals}. balance: ${depositAmount}`);
      }
    }
    const bnAmount = new BN(amountDecimals * 10 ** usdcDecimals);

    //  now create the ixs
    let solendAction = await SolendAction.buildWithdrawTxns(
      this.systemSolanaClient.getConnection(),
      bnAmount,
      "USDC",
      depositor,
      this.factoryService.getSolendEnv()
    );

    const ixs: Array<TransactionInstruction> = [];
    let {preLendingTxn, lendingTxn, postLendingTxn} = await solendAction.getTransactions();
    let txid = null;
    if (preLendingTxn) {
      // shouldn't be anything here but todo: perform the transaction if we encounter it
      this.logger.warn(`---- unexpected lending withdraw preLendingTxn tx: `, preLendingTxn);
      // txid = await provider.sendAndConfirm(preLendingTxn);
      console.log(`---- sol lending preLendingTxn txid: `, txid);
    }
    if (lendingTxn) {
      // this SHOULD be populated
      for (const ix of lendingTxn.instructions) {
        ixs.push(ix);
      }
    }
    if (postLendingTxn) {
      // shouldn't be anything here
      this.logger.warn(`---- unexpected lending withdraw postLendingTxn tx: `, postLendingTxn);
    }
    return ixs;
  }

}
