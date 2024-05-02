import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { Injectable, Logger } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { SolanaService } from "../../solana/solana.service";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { User } from "../../db/models/User";
import { USER_ROLE } from "../../db/db.types";
import { ConfigService } from "@nestjs/config";
import { SolanaClient } from "../../solana/solanaclient";
import { Action } from "../../db/models/Action";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { MEMO_PROGRAM_ID } from "../api-constants";
import { isWithinPercentThreshold } from "../../utils/misc";
import { SystemService } from "./system.service";
import { Paylink } from "../../db/models/Paylink";

@Injectable()
export class TransactionService extends AbstractService {

  private lendingEnabled: boolean;
  private solanaClient: SolanaClient;

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly configService: ConfigService,
    readonly solanaService: SolanaService
  ) {
    super(TransactionService.name, em, orm, factoryService, userRepository, systemService);
    this.solanaClient = this.factoryService.solanaClient();
    this.lendingEnabled = this.configService.get("ENABLE_LENDING") === "true";
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("transaction service initialized...");
  }

  async initWalletAndTokenAccount(toSolanaAddress: PublicKey, mint: PublicKey, initWallet: boolean = false) {
    const tx = new Transaction();
    let inittedWallet = false;
    if (initWallet) {
      // check to see if the toWallet exists on-chain yet
      const toWalletSolBalance = await this.solanaClient.getSolBalance(toSolanaAddress);
      if (toWalletSolBalance === 0) {
        // todo: remove this hardcoded value
        tx.add(await this.solanaClient.sendSolIx(toSolanaAddress, 0.001 * LAMPORTS_PER_SOL, false));
        this.logger.debug(`adding ix: sending 0.001 SOL to initialize empty wallet: ${toSolanaAddress.toBase58()}`);
        inittedWallet = true;
      }
    }

    // might be sending to new wallet, so check if they have a token account for this mint and if not we'll create one
    const toAta = getAssociatedTokenAddressSync(mint, toSolanaAddress, true);
    const maybeMissingAccountTx = await this.solanaClient.createTransactionWithMissingAta(mint, toSolanaAddress, toAta, this.factoryService.getSystemSigner());
    if (maybeMissingAccountTx.instructions.length > 0) {
      tx.add(...maybeMissingAccountTx.instructions);
    }

    // if the tx has instructions, then we need to send it to create the token account (and possibly init the end-wallet a bit)
    if (tx.instructions.length > 0) {
      // do it this way so system creates the token account if needed instead of user
      const systemSigner = this.factoryService.getSystemSigner();
      const txid = await this.solanaClient.sendTx(tx, systemSigner.publicKey, [systemSigner]);
      let debugMessage = `Created missing ATA for ${toSolanaAddress.toBase58()} for mint ${mint.toBase58()} `;
      if (inittedWallet) {
        debugMessage += `and sent 0.001 SOL to initialize empty wallet `;
      }
      debugMessage += `txid: ${txid}`;
      this.logger.debug(debugMessage);
      await this.solanaClient.confirmTransaction(txid, "finalized");
      return txid;
    } else {
      return null;
    }
  }

  // submit a transfer to solana
  async transfer(fromUser: User, toSolanaAddress: PublicKey, mint: PublicKey, amountDecimals: number, initWallet: boolean = false): Promise<string> {
    let signer: Keypair = null;
    let txid: string | null = null;
    let tx: Transaction = new Transaction();
    if (fromUser.role === USER_ROLE.SYSTEM) {
      signer = this.factoryService.getSystemSigner();
    } else {
      signer = fromUser.keypair();
    }
    let inittedWallet = false;

    // todo issue: potential abuse if someone transfers to a bunch of non-existent wallets and then recovers the sol
    // initialize the receiving wallet along with the token account (if needed)
    txid = await this.initWalletAndTokenAccount(toSolanaAddress, mint, initWallet);
    if (txid) {
      this.logger.debug(`Created missing ATA for ${toSolanaAddress.toBase58()} for mint ${mint.toBase58()} txid: ${txid}`);
    }

    // now send the tokens
    let realAmount = amountDecimals;

    // if lending is enabled, then first withdraw from the lending program
    if (fromUser.role !== USER_ROLE.SYSTEM && this.lendingEnabled) {
      // then pull from savings first
      const lendingDepositAmount = await this.solanaService.getLendingDepositAmount(signer.publicKey);
      if (lendingDepositAmount < realAmount) {
        if (isWithinPercentThreshold(lendingDepositAmount, realAmount, 0.005)) {
          // todo: analytics or log
          this.logger.warn(`User ${fromUser.id}: ${signer.publicKey.toBase58()} doesn't quite have funds in savings. pulling ${lendingDepositAmount} instead of ${realAmount}`);
          realAmount = lendingDepositAmount;
        } else {
          // todo: analytics or log
          this.logger.warn(`User ${fromUser.id}: ${signer.publicKey.toBase58()} has insufficient funds in savings to withdraw ${amountDecimals}. balance: ${lendingDepositAmount}`);
          throw new Error(`cannot withdraw ${amountDecimals}. balance: ${lendingDepositAmount}`);
        }
      }
      const pullLendingIxs = await this.solanaService.createLendingWithdrawIxs(mint, signer.publicKey, realAmount);
      for (const ix of pullLendingIxs) {
        tx.add(ix);
      }
      // 1st tx: need to pull tokens from user's savings (broken into 2 txs cause didn't work w/1, same as the deposit)
      const txid = await this.solanaClient.sendTx(tx, signer.publicKey, [signer]);
      await this.solanaClient.confirmTransaction(txid, "finalized");
      this.logger.debug(`Withdrew ${realAmount} ${mint.toBase58()} (USDC) from user ${fromUser.id}: ${signer.publicKey.toBase58()} savings, txid: ${txid}`);
      tx = new Transaction();
    } // --end lending withdrawal

    // now send to wallet ixs - don't check balance cause they'll be being withdrawn
    const sendTokensIxs = await this.solanaService.createSendTokensIxs(mint, signer.publicKey, toSolanaAddress, realAmount, true);
    for (const ix of sendTokensIxs) {
      tx.add(ix);
    }
    // add a memo for the actionId for syncing later
    /*
    const memo = `|{transferId:${transfer.id}}|`;
    tx.add(
      new TransactionInstruction({
        keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memo),
        programId: MEMO_PROGRAM_ID
      })
    );
     */
    // submit the tx
    txid = await this.solanaClient.sendTx(tx, signer.publicKey, [signer]);
    await this.solanaClient.confirmTransaction(txid);
    this.logger.debug(`Sent ${realAmount} ${mint.toBase58()} (USDC) from user ${fromUser.id}: ${signer.publicKey.toBase58()} to wallet: ${toSolanaAddress.toBase58()}, txid: ${txid}`);
    return txid;
  }


  // send a user payment somewhere from given user, if user is not system, then pull from lending/savings
  async sendPaymentToWallet(fromUser: User, toWallet: PublicKey, mint: PublicKey, amountDecimals: number, actionToUpdate: Action, initWallet: boolean = false): Promise<string> {
    let signer: Keypair = null;
    let txid: string | null = null;
    let tx: Transaction = new Transaction();
    if (fromUser.role === USER_ROLE.SYSTEM) {
      signer = this.factoryService.getSystemSigner();
    } else {
      signer = fromUser.keypair();
    }
    let inittedWallet = false;

    if (initWallet) {
      // check to see if the toWallet exists on-chain yet
      const toWalletSolBalance = await this.solanaClient.getSolBalance(toWallet);
      if (toWalletSolBalance === 0) {
        // todo: remove this hardcoded value
        tx.add(await this.solanaClient.sendSolIx(toWallet, 0.003 * LAMPORTS_PER_SOL, false));
        this.logger.debug(`adding ix: sending 0.002 SOL to initialize empty wallet: ${toWallet.toBase58()}`);
        inittedWallet = true;
      }
    }

    // might be sending to new wallet, so check if they have a token account for this mint and if not we'll create one
    const toAta = getAssociatedTokenAddressSync(mint, toWallet, true);
    const maybeMissingAccountTx = await this.solanaClient.createTransactionWithMissingAta(mint, toWallet, toAta, this.factoryService.getSystemSigner());
    if (maybeMissingAccountTx.instructions.length > 0) {
      tx.add(...maybeMissingAccountTx.instructions);
    }

    if (tx.instructions.length > 0) {
      // do it this way so system creates the token account if needed instead of user
      const systemSigner = this.factoryService.getSystemSigner();
      txid = await this.solanaClient.sendTx(tx, systemSigner.publicKey, [systemSigner]);
      await this.em.transactional(async em => {
        actionToUpdate.addRebelTransaction(txid);
        await em.persistAndFlush(actionToUpdate);
      });
      let debugMessage = `Created missing ATA for ${toWallet.toBase58()} for mint ${mint.toBase58()} `;
      if (inittedWallet) {
        debugMessage += `and sent 0.002 SOL to initialize empty wallet `;
      }
      debugMessage += `txid: ${txid}`;
      this.logger.debug(debugMessage);
      await this.solanaClient.confirmTransaction(txid, "finalized");
      tx = new Transaction();
    }

    // now send the tokens
    let realAmount = amountDecimals;

    if (fromUser.role !== USER_ROLE.SYSTEM && this.lendingEnabled) {
      // then pull from savings first
      const lendingDepositAmount = await this.solanaService.getLendingDepositAmount(signer.publicKey);
      if (lendingDepositAmount < realAmount) {
        if (isWithinPercentThreshold(lendingDepositAmount, realAmount, 0.005)) {
          this.logger.warn(`User ${fromUser.id}: ${signer.publicKey.toBase58()} doesn't quite have funds in savings. pulling ${lendingDepositAmount} instead of ${realAmount}`);
          realAmount = lendingDepositAmount;
        } else {
          this.logger.warn(`User ${fromUser.id}: ${signer.publicKey.toBase58()} has insufficient funds in savings to withdraw ${amountDecimals}. balance: ${lendingDepositAmount}`);
          throw new Error(`cannot withdraw ${amountDecimals}. balance: ${lendingDepositAmount}`);
        }
      }
      const pullLendingIxs = await this.solanaService.createLendingWithdrawIxs(mint, signer.publicKey, realAmount);
      for (const ix of pullLendingIxs) {
        tx.add(ix);
      }
      // 1st tx: need to pull tokens from user's savings (broken into 2 txs cause didn't work w/1, same as the deposit)
      const txid = await this.solanaClient.sendTx(tx, signer.publicKey, [signer]);
      if (actionToUpdate) {
        await this.em.transactional(async em => {
          actionToUpdate.addRebelTransaction(txid);
          await em.persistAndFlush(actionToUpdate);
        });
      }
      await this.solanaClient.confirmTransaction(txid, "finalized");
      this.logger.debug(`Withdrew ${realAmount} ${mint.toBase58()} (USDC) from user ${fromUser.id}: ${signer.publicKey.toBase58()} savings, txid: ${txid}`);
      tx = new Transaction();
    }
    // now send to wallet ixs - don't check balance cause they'll be being withdrawn
    const sendTokensIxs = await this.solanaService.createSendTokensIxs(mint, signer.publicKey, toWallet, realAmount, true);
    for (const ix of sendTokensIxs) {
      tx.add(ix);
    }
    // add a memo for the actionId for syncing later
    const memo = `|{actionId:${actionToUpdate.id}}|`;
    tx.add(
      new TransactionInstruction({
        keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memo),
        programId: MEMO_PROGRAM_ID
      })
    );
    // submit the tx
    txid = await this.solanaClient.sendTx(tx, signer.publicKey, [signer]);
    // update the action immediately
    await this.em.transactional(async em => {
      actionToUpdate.submittedTx(txid);
      await em.persistAndFlush(actionToUpdate);
    });
    this.logger.debug(`Updated action ${actionToUpdate.id} with pending txid: ${txid}`);
    await this.solanaClient.confirmTransaction(txid);
    this.logger.debug(`Sent ${realAmount} ${mint.toBase58()} (USDC) from user ${fromUser.id}: ${signer.publicKey.toBase58()} to wallet: ${toWallet.toBase58()}, txid: ${txid}`);
    return txid;
  }

  async sendPaymentToUser(fromUser: User, toUser: User, mint: PublicKey, amountDecimals: number, actionToUpdate: Action): Promise<string> {
    const toWallet = new PublicKey(toUser.walletAddress);
    return await this.sendPaymentToWallet(fromUser, toWallet, mint, amountDecimals, actionToUpdate);
  }

  async depositIntoLending(user: User, mint: PublicKey, amountDecimal: number, actionToUpdate?: Action): Promise<string | null> {
    if (this.lendingEnabled) {
      const userKeypair = user.keypair();
      // first, check that the user has the amount of tokens that we're trying to deposit
      const balance = await this.solanaClient.getTokenBalance(mint, userKeypair.publicKey);
      if (balance < amountDecimal) {
        this.logger.error(`can't deposit ${amountDecimal} ${mint.toBase58()} (USDC) into lending for user ${user.id}: ${userKeypair.publicKey.toBase58()} because they only have ${balance} ${mint.toBase58()} (USDC)`);
        throw new Error(`Insufficient funds. Trying to deposit ${amountDecimal}, balance: ${balance}`);
      }

      const tx = new Transaction();
      const lendingIxs = await this.solanaService.createLendingDepositIxs(mint, userKeypair.publicKey, amountDecimal);
      for (const ix of lendingIxs) {
        tx.add(ix);
      }
      // now sign and submit the tx
      const txid = await this.solanaClient.sendTx(tx, userKeypair.publicKey, [userKeypair]);
      if (actionToUpdate) {
        await this.em.transactional(async em => {
          actionToUpdate.submittedTx(txid);
          await em.persistAndFlush(actionToUpdate);
        });
        this.logger.debug(`Updated action ${actionToUpdate.id} with pending txid: ${txid}`);
      }
      await this.solanaClient.confirmTransaction(txid);
      this.logger.debug(`Lending deposit: Sent ${amountDecimal} ${mint.toBase58()} from ${userKeypair.publicKey.toBase58()} to savings, txid: ${txid}`);
      return txid;
    } else {
      return null;
    }
  }

  // pass in the action so that it gets updated with the relevant transfer txid immediately so it gets picked up by the sync cron properly
  async fundUser(fromUser: User, toUser: User, mint: PublicKey, amountDecimals: number, existingTx?: Transaction, actionToUpdate?: Action): Promise<string> {
    // first ix: send funds to user wallet
    let tx: Transaction = existingTx ?? new Transaction();
    let signer: Keypair = null;
    let action = "PAYMENT";
    if (fromUser.role === USER_ROLE.SYSTEM) {
      signer = this.factoryService.getSystemSigner();
      action = "FUNDING";
    } else {
      signer = fromUser.keypair();
    }
    const toUserKeypair = toUser.keypair();
    const sendTokensIxs = await this.solanaService.createSendTokensIxs(mint, signer.publicKey, toUserKeypair.publicKey, amountDecimals);
    for (const ix of sendTokensIxs) {
      tx.add(ix);
    }
    if (actionToUpdate) {
      // add a memo for the actionId for syncing later
      const memo = `|{actionId:${actionToUpdate.id}}|`;
      tx.add(
        new TransactionInstruction({
          keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: true }],
          data: Buffer.from(memo),
          programId: MEMO_PROGRAM_ID
        })
      );
    }
    // first tx: need to send tokens to user's wallet. if i try to do this in 1 tx, get a 0xe error (or there was something wrong)
    let txid = await this.solanaClient.sendTx(tx, signer.publicKey, [signer]);
    // update the action immediately
    if (actionToUpdate) {
      await this.em.transactional(async em => {
        actionToUpdate.submittedTx(txid);
        await em.persistAndFlush(actionToUpdate);
      });
      this.logger.debug(`Updated action ${actionToUpdate.id} with pending txid: ${txid}`);
    }
    // todo: try on this confirm in case it bombs
    await this.solanaClient.confirmTransaction(txid, "finalized");
    this.logger.debug(`Sent ${action}: ${amountDecimals} ${mint.toBase58()} from ${signer.publicKey.toBase58()} to ${toUserKeypair.publicKey.toBase58()} wallet, txid: ${txid}`);

    // 2nd tx = deposit into lending (savings)
    if (this.lendingEnabled) {
      tx = new Transaction();
      const lendingIxs = await this.solanaService.createLendingDepositIxs(mint, toUserKeypair.publicKey, amountDecimals);
      for (const ix of lendingIxs) {
        tx.add(ix);
      }
      // now sign and execute the tx
      txid = await this.solanaClient.sendTx(tx, toUserKeypair.publicKey, [toUserKeypair]);
      if (actionToUpdate) {
        await this.em.transactional(async em => {
          actionToUpdate.addRebelTransaction(txid);
          await em.persistAndFlush(actionToUpdate);
        });
      }
      await this.solanaClient.confirmTransaction(txid);
      this.logger.debug(`Lending deposit: Sent ${amountDecimals} ${mint.toBase58()} from ${signer.publicKey.toBase58()} to ${toUserKeypair.publicKey.toBase58()} savings, txid: ${txid}`);
    }
    // return the txid of the token transfer
    return txid;
  }

  async disbursePaylink(paylinkId: number, actionToUpdate: Action) {
    // todo: break this up into multiple db transactions (like above)
    await this.em.transactional(async em => {
      const paylink: Paylink = await em.findOneOrFail(Paylink, { id: paylinkId }, { populate: ["createdBy", "claimedBy", "token"] });
      if (!paylink.canDisburse()) {
        throw new Error(`Paylink ${paylinkId} cannot be processed. Status: ${paylink.status}`);
      }
      const creator = paylink.createdBy;
      const claimant = paylink.claimedBy;

      let tx = new Transaction();
      const paylinkWallet = paylink.keypair();
      const mint = new PublicKey(paylink.token.mint);
      const amount = paylink.amount;
      const toWallet = new PublicKey(claimant.walletAddress);

      const toAta = getAssociatedTokenAddressSync(mint, toWallet, true);
      let txid = null;
      const systemSigner = this.factoryService.getSystemSigner();

      // create the token account if we need to
      const maybeMissingAccountTx = await this.solanaClient.createTransactionWithMissingAta(mint, toWallet, toAta, systemSigner);
      if (maybeMissingAccountTx.instructions.length > 0) {
        const systemSigner = this.factoryService.getSystemSigner();
        txid = await this.solanaClient.sendTx(maybeMissingAccountTx, systemSigner.publicKey, [systemSigner]);
        if (actionToUpdate) {
          await this.em.transactional(async em => {
            actionToUpdate.addRebelTransaction(txid);
            await em.persistAndFlush(actionToUpdate);
          });
        }
        this.logger.debug(`Created missing ATA for ${toWallet.toBase58()} for mint ${mint.toBase58()}, txid: ${txid}`);
        await this.solanaClient.confirmTransaction(txid, "finalized");
        actionToUpdate.addRebelTransaction(txid);
        tx = new Transaction();
      }

      // add instructions to send all the tokens from the paylink
      const paylinkTokenAccount = await this.solanaClient.getTokenAccountInfo(mint, paylinkWallet.publicKey);
      const fromAta = paylinkTokenAccount.ata;

      let ixs = await this.solanaClient.sendTokensIxs(paylinkWallet.publicKey, toWallet, paylinkTokenAccount.balance, mint, paylinkTokenAccount.decimals, false);
      tx.add(...ixs);

      // close the token account and send the remaining lamports to us (since we probably created the account)
      tx.add(this.solanaClient.closeTokenAccountIx(fromAta, systemSigner.publicKey, paylinkWallet.publicKey));

      txid = await this.solanaClient.sendTransaction(tx, [paylinkWallet]);
      this.logger.debug(`sent tokens and closed token account in tx: ${txid}`);
      actionToUpdate.submittedTx(txid);

      // transfer all the lamports from the paylink wallet to us
      txid = await this.solanaClient.drainLamports(paylinkWallet.publicKey, systemSigner.publicKey, paylinkWallet);
      this.logger.debug(`drained lamports from paylink wallet in tx: ${txid}`);
      actionToUpdate.addRebelTransaction(txid);

      await em.persistAndFlush(actionToUpdate);

    });
  }
}
