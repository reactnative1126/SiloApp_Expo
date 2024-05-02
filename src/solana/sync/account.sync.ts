import { Injectable, OnModuleInit } from "@nestjs/common";
import { MikroORM } from "@mikro-orm/core";
import {
  ParsedInstruction,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  PublicKey,
  SignaturesForAddressOptions
} from "@solana/web3.js";
import { sliceIntoChunks } from "../../utils/misc";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { FactoryService } from "../../common/service/factory.service";
import { TokenAccount } from "../../db/models/TokenAccount";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BlockTx } from "../../db/models/BlockTx";
import { Action } from "../../db/models/Action";
import { ACCOUNT_TX_ACTION_TYPE, ACTION_STATUS, ACTION_TARGET_TYPE, ACTION_TYPE } from "../../db/db.types";
import { AccountTx } from "../../db/models/AccountTx";
import { AbstractSync } from "./abstract.sync";
import { BlockTxRepository } from "../../db/repositories/blocktx.repository";
import { ConfigService } from "@nestjs/config";
import { RebelTx } from "../../db/models/RebelTx";
import { SolanaDbService } from "../service/solanadb.service";

// sync accounts w/chain

@Injectable()
export class AccountSync extends AbstractSync implements OnModuleInit {

  @InjectRepository(TokenAccount)
  private tokenAccountRepository: EntityRepository<TokenAccount>;
  private lendingEnabled: boolean;

  private static SOLEND_PROGRAM_ID = new PublicKey("So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo");

  constructor(
    factoryService: FactoryService,
    em: EntityManager,
    orm: MikroORM,
    blockTxRepository: BlockTxRepository,
    readonly configService: ConfigService,
    readonly solanaDbService: SolanaDbService
  ) {
    super(AccountSync.name, factoryService, em, orm, blockTxRepository);
    this.solanaClient = factoryService.solanaClient();
    this.connection = factoryService.solanaConnection();
    this.throttler = factoryService.getSolanaThrottler();

    if (this.configService.get("ENABLE_LENDING") === "true") {
      this.lendingEnabled = true;
    } else {
      this.lendingEnabled = false;
    }
  }

  async onModuleInit(): Promise<any> {
    /*
    if (!this.enabled) {
      this.logger.warn('AccountSync disabled.');
    } else {
      this.logger.debug('AccountSync initializing...');
    }
     */
  }

  // fetches all the txids for a given program id until the given until sig is found or until there aren't anymore
  // returns the txids in order from oldest to newest
  private async fetchSignaturesForAddress(address: PublicKey, until: string) {
    let options: SignaturesForAddressOptions | undefined = until ? { until } : undefined;
    const allSigs: string[] = [];
    // first get all the sigs
    let sigs = await this.throttler.schedule(async () => {
      return await this.connection.getSignaturesForAddress(address, options);
    });
    while (sigs.length > 0) {
      for (const sig of sigs) {
        if (!until || (until && sig.signature !== until)) {
          allSigs.push(sig.signature);
        }
      }
      options = { before: allSigs.slice(-1)[0], until };
      sigs = await this.throttler.schedule(() => {
        return this.connection.getSignaturesForAddress(address, options);
      });
    }
    console.log(`allSigs: ${allSigs.length}`);
    // flip the sigs so we process in order
    return allSigs.reverse();
  }

  // todo: there's probably better way to do this
  // goes through all the user token accounts for the given mint and syncs them w/chain
  async syncTokenAccounts(mint: PublicKey) {

    // fetch all the token account ids for the given mint
    const tokenAccounts = await this.em.transactional(async (em) => {
      return await this.tokenAccountRepository.find({ token: { mint: mint.toBase58() }, user: { status: "ACTIVE" } }, {
        // fields: ["id", "ata", "lastSyncedBlockTx.txid"],
        populate: ["token", "lastSyncedBlockTx"]
      });
    });

    this.logger.debug(`syncing ${tokenAccounts.length} token accounts for mint: ${mint.toBase58()}`);

    // process each token account
    for (const tokenAccount of tokenAccounts) {
      await this.syncTokenAccount(tokenAccount);
    }
  }

  // TokenAccount only has the id, ata and lastSyncedBlockTx.txid fields populated
  async syncTokenAccount(tokenAccount: TokenAccount) {
    let lastTxid = tokenAccount.lastSyncedBlockTx?.txid ?? null;
    // SHOULD always be populated
    const sigs = await this.fetchSignaturesForAddress(new PublicKey(tokenAccount.ata), lastTxid);
    await this.processTokenAccountTransactions(tokenAccount, sigs);
    return tokenAccount;
  }

  async processTokenAccountTransactions(tokenAccount: TokenAccount, allSigs: string[]) {
    const chunks = sliceIntoChunks(allSigs, 10);
    for (const chunk of chunks) {
      await this.processTokenAccountTxChunk(tokenAccount, chunk);
    }
  }

  // credit/debit token accounts from the given tx
  private async processTokenAccountTxChunk(tokenAccount: TokenAccount, chunk: string[]) {
    const txs = await this.throttler.schedule(() => {
      return this.connection.getParsedTransactions(chunk, { maxSupportedTransactionVersion: 0 });
    });
    for (const tx of txs) {
      await this.processTokenAccountTx(tokenAccount, tx);
    }
  }

  // note: this function shares a lot of code w/the one below (processParsedTx)
  private async processTokenAccountTx(tokenAccount: TokenAccount, tx: ParsedTransactionWithMeta) {
    await this.em.transactional(async (em) => {
      const txid = tx.transaction.signatures[0];
      // see if we've processed this tx before
      const existingTx = await em.findOne(BlockTx, { txid });
      if (existingTx) {
        // skip this guy - already processed
        this.logger.debug(`skipping synced tx: ${tx.transaction.signatures[0]}`);
        tokenAccount.syncedBlock(existingTx);
        await em.persistAndFlush(tokenAccount);
        this.logger.debug(`updated lastSyncedBlockTx for tokenAccount: ${tokenAccount.id} to ${existingTx.txid}`);
        return;
      }

      // for debugging, if we don't find the instruction (if it was in a partiallydecoded instead of ParsedInstruction, we'll log
      let foundInstruction = false;

      // go through the instructions and look for a transfer or transferChecked
      for (const instruction of tx.transaction.message.instructions) {
        if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
          // @ts-ignore
          if (instruction.parsed && (instruction.parsed.type === "transferChecked" || instruction.parsed.type === "transfer")) {
            // handle ParsedInstruction

            // @ts-ignore
            const info = instruction.parsed?.info;
            const fromAddressString: string = info.source;
            const toAddressString: string = info.destination;
            const mint = info.mint;
            const authority = info.authority;
            const amountDecimals = info.tokenAmount.uiAmount;

            // true if this is a deposit or withdrawal from a lending protocol (i.e. solend)
            const usdcReserve = this.factoryService.getSolendUsdcReserve();
            const isLendingTx = usdcReserve.config.liquidityAddress === fromAddressString || usdcReserve.config.liquidityAddress === toAddressString;
            if (isLendingTx) {
              // todo: fix this since we're filtering by token program right now so we'll never get here
              if (usdcReserve.config.liquidityAddress === fromAddressString) {
                this.logger.debug(`processing lending protocol deposit: ${txid}`);
              } else {
                this.logger.debug(`processing lending protocol withdrawal: ${txid}`);
              }
            }

            // see if this is a transfer we're looking for
            if (mint === tokenAccount.token.mint && (fromAddressString === tokenAccount.ata || toAddressString === tokenAccount.ata)) {
              foundInstruction = true;
              // look up our token accounts
              const fromTokenAccount = await em.findOne(TokenAccount, { ata: fromAddressString }, { populate: ["user.currency"] });
              const toTokenAccount = await em.findOne(TokenAccount, { ata: toAddressString }, { populate: ["user.currency"] });

              // at least 1 of these should be populated
              const fromUser = fromTokenAccount?.user ?? null;
              const toUser = toTokenAccount?.user ?? null;

              // create the blocktx record
              // we do it this way so balances get updated immediately before full sync
              const blockTx = await this.solanaDbService.createDbTx(tx);
              // const blockTx = new BlockTx(txid, new Date(tx.blockTime * 1000), tx.slot);
              // await this.em.persistAndFlush(blockTx);

              // look for any action that points to this tx and fill in the blocktx (note: later might be multiple actions)
              const action = await em.findOne(Action, { txid: txid }, { populate: ["accountTransactions"] });
              let isFunding = false;
              let isPayment = false;
              let knownTx = false;
              if (action) {
                if (!action.blockTx) {
                  action.sync(blockTx);
                  em.persist(action);
                  knownTx = true;
                }
                if (action.actionType === ACTION_TYPE.FUNDING) {
                  // found a funding action for this txid. mark as funding
                  isFunding = true;
                } else if (action.actionType === ACTION_TYPE.PAYMENT) {
                  isPayment = true;
                }
              }

              if (!knownTx) {
                // then see if this tx was initiated by us
                const foundTx = await em.findOne(RebelTx, { txid: txid });
                if (foundTx) {
                  knownTx = true;
                }
              }

              // todo: handle the withdraw/deposit cases

              // now we creae 2 AccountTxes if they don't already exist - 1 for each user (1 credit, 1 debit)
              if (fromUser) {
                // see if there's already an AccountTx that points to an action w/this txid
                const existingDebitTx = action?.getDebitTransaction();
                if (existingDebitTx && existingDebitTx.tokenAccount.user.id === fromUser.id) {
                  // we already have a debit tx for this user. skip
                  this.logger.debug(`found existing debit tx for user: ${fromUser.id} for tx: ${txid}`);
                  // shouldn't be necessary cause we probably hit it above when updating the action
                  // existingDebitTx.synced();
                } else {
                  const fromTxType = isFunding ? ACCOUNT_TX_ACTION_TYPE.FUNDING : ACCOUNT_TX_ACTION_TYPE.PAYMENT;  // todo: assuming payment here for now
                  const fromAcctTx = new AccountTx(fromTxType, blockTx, fromTokenAccount, -amountDecimals, null, fromUser.currency);
                  if (toUser) {
                    fromAcctTx.withCounterparty(toUser);
                  } else {
                    if (isLendingTx) {
                      fromAcctTx.setCounterparty("Savings Deposit", toAddressString);
                    } else {
                      fromAcctTx.setCounterparty("Unknown", toAddressString);
                    }
                  }
                  // don't include the lending txs in the balance calc
                  if (!isLendingTx) {
                    fromTokenAccount.addAndSyncTransaction(fromAcctTx);
                  }
                }
                // await this.em.persistAndFlush(fromAcctTx);
                await this.em.persistAndFlush(fromTokenAccount);
              }

              if (toUser) {
                const existingCreditTx = action?.getCreditTransaction();
                if (existingCreditTx && existingCreditTx.tokenAccount.user.id == toUser.id) {
                  // we already have a credit tx for this user. skip
                  this.logger.debug(`found existing credit tx for user: ${toUser.id} for tx: ${txid}`);
                  // shouldn't be necessary cause we probably hit it above when updating the action
                  // existingCreditTx.synced();
                } else {
                  // todo: no difference b/w deposits and receipts (of payments) for now
                  const toTxType = isFunding ? ACCOUNT_TX_ACTION_TYPE.FUNDING : ACCOUNT_TX_ACTION_TYPE.RECEIPT;
                  const toAcctTx = new AccountTx(toTxType, blockTx, toTokenAccount, amountDecimals, null, toUser.currency);
                  if (fromUser) {
                    toAcctTx.withCounterparty(fromUser);
                  } else {
                    if (isLendingTx) {
                      toAcctTx.setCounterparty("Savings Withdrawal", fromAddressString);
                    } else {
                      toAcctTx.setCounterparty("Unknown", fromAddressString);
                    }
                  }
                  if (!isLendingTx && !knownTx) {
                    toTokenAccount.addAndSyncTransaction(toAcctTx);
                    // in this case we'll create an action to be processed later to deposit funds into savings
                    if (!toUser.isSystem() && this.lendingEnabled) {
                      this.logger.debug(`not lending tx or known tx: ${txid}, so creating action to deposit ${amountDecimals} USDC into savings for user: ${toUser.id}`);
                      const action = new Action(toUser, toUser.id.toString(), ACTION_TARGET_TYPE.LENDING, ACTION_TYPE.LEND_DEPOSIT);
                      action.params = {
                        mint,
                        amountDecimal: amountDecimals,
                        tokenAccountId: toTokenAccount.id
                      };
                      action.confirmed();
                      em.persist(action);
                    }
                  }
                }
                // await this.em.persistAndFlush(toAcctTx);
                await this.em.persistAndFlush(toTokenAccount);
              }
            }
          }
        }
      }
      if (!foundInstruction) {
        this.logger.warn(`couldn't find token transfer instruction for tx: ${tx.transaction.signatures[0]}`);
        const blockTx = await this.solanaDbService.createDbTx(tx);

        // could be a lending tx, so let's check for that and update to synced if we find one
        const action = await em.findOne(Action, { txid: txid }, { populate: ["accountTransactions.blockTx"] });
        if (action) {
          if (action.status === ACTION_STATUS.PROCESSED) {
            action.sync(blockTx);
            em.persist(action);
          } else {
            this.logger.warn(`found action for tx: ${txid} but status is ${action.status} instead of PROCESSED. so not syncing...`);
          }
        }

        // update the last synced tx
        tokenAccount.syncedBlock(blockTx);
        await em.persistAndFlush(tokenAccount);
        this.logger.debug(`updated lastSyncedBlockTx for tokenAccount: ${tokenAccount.id} to ${blockTx.txid}`);
      }
    });
  }

  isTransferIx(instruction: ParsedInstruction | PartiallyDecodedInstruction) {
    //@ts-ignore
    return instruction.programId.equals(TOKEN_PROGRAM_ID) && (instruction.parsed?.type === "transferChecked" || instruction.parsed?.type === "transfer");
  }


  async processTransferIx(tx: ParsedTransactionWithMeta, instruction: ParsedInstruction | PartiallyDecodedInstruction, blockTx: BlockTx, isFunding: boolean, knownTx: boolean, em: EntityManager, action?: Action) {
    const txid = tx.transaction.signatures[0];
    // @ts-ignore
    const info = instruction.parsed?.info;
    const fromAddressString: string = info.source;
    const toAddressString: string = info.destination;
    const mint = info.mint;
    const authority = info.authority;
    const amountDecimals = info.tokenAmount.uiAmount;

    // true if this is a deposit or withdrawal from a lending protocol (i.e. solend)
    const usdcReserve = this.factoryService.getSolendUsdcReserve();
    const isLendingTx = usdcReserve.config.liquidityAddress === fromAddressString || usdcReserve.config.liquidityAddress === toAddressString;
    let isDeposit = true;
    if (isLendingTx) {
      if (usdcReserve.config.liquidityAddress === fromAddressString) {
        this.logger.debug(`processing lending protocol deposit: ${txid}`);
      } else {
        isDeposit = false;
        this.logger.debug(`processing lending protocol withdrawal: ${txid}`);
      }
    }

    // look up our token accounts
    const fromTokenAccount = await em.findOne(TokenAccount, { ata: fromAddressString }, { populate: ["user.currency"] });
    const toTokenAccount = await em.findOne(TokenAccount, { ata: toAddressString }, { populate: ["user.currency"] });

    if (fromTokenAccount || toTokenAccount) {

      // at least 1 of these should be populated
      const fromUser = fromTokenAccount?.user ?? null;
      const toUser = toTokenAccount?.user ?? null;


      // todo: handle the withdraw/deposit cases (not sure this still applies ..?)

      // todo: proper counterparty handling (contact, paylink (reclaim), email, etc...)

      // now we creae 2 AccountTxes if they don't already exist - 1 for each user (1 credit, 1 debit)
      if (fromUser) {
        // see if there's already an AccountTx that points to an action w/this txid
        const existingDebitTx = action?.getDebitTransaction();
        if (existingDebitTx && existingDebitTx.tokenAccount.user.id === fromUser.id) {
          // we already have a debit tx for this user. skip
          this.logger.debug(`found existing debit tx for user: ${fromUser.id} for tx: ${txid}`);
          // shouldn't be necessary cause we probably hit it above when updating the action
          // existingDebitTx.synced();
        } else {
          const fromTxType = isFunding ? ACCOUNT_TX_ACTION_TYPE.FUNDING : ACCOUNT_TX_ACTION_TYPE.PAYMENT;  // default = payment since it's a from account
          const fromAcctTx = new AccountTx(fromTxType, blockTx, fromTokenAccount, -amountDecimals, null, fromUser.currency);
          if (toUser) {
            fromAcctTx.withCounterparty(toUser);
          } else {
            if (isLendingTx) {
              fromAcctTx.setCounterparty("Savings Deposit", toAddressString);
            } else {
              fromAcctTx.setCounterparty("Unknown", toAddressString);
            }
          }
          // don't include the lending txs in the balance calc
          if (!isLendingTx) {
            // don't set the lastSynced since this function isn't called from the token account sync
            fromTokenAccount.addAndSyncTransaction(fromAcctTx, false);
          }
        }
        // await this.em.persistAndFlush(fromAcctTx);
        await this.em.persistAndFlush(fromTokenAccount);
      }

      if (toUser) {
        const existingCreditTx = action?.getCreditTransaction();
        if (existingCreditTx && existingCreditTx.tokenAccount.user.id == toUser.id) {
          // we already have a credit tx for this user. skip
          this.logger.debug(`found existing credit tx for user: ${toUser.id} for tx: ${txid}`);
          // shouldn't be necessary cause we probably hit it above when updating the action
          // existingCreditTx.synced();
        } else {
          // todo: no difference b/w deposits and receipts (of payments) for now
          const toTxType = isFunding ? ACCOUNT_TX_ACTION_TYPE.FUNDING : ACCOUNT_TX_ACTION_TYPE.RECEIPT;
          const toAcctTx = new AccountTx(toTxType, blockTx, toTokenAccount, amountDecimals, null, toUser.currency);
          if (fromUser) {
            toAcctTx.withCounterparty(fromUser);
          } else {
            if (isLendingTx) {
              toAcctTx.setCounterparty("Savings Withdrawal", fromAddressString);
            } else {
              toAcctTx.setCounterparty("Unknown", fromAddressString);
            }
          }
          if (!isLendingTx && !knownTx) {
            // again: don't set last synced
            toTokenAccount.addAndSyncTransaction(toAcctTx, false);
            // in this case we'll create an action to be processed later to deposit funds into savings
            if (!toUser.isSystem() && this.lendingEnabled) {
              this.logger.debug(`not lending tx or known tx: ${txid}, so creating action to deposit ${amountDecimals} USDC into savings for user: ${toUser.id}`);
              const action = new Action(toUser, toUser.id.toString(), ACTION_TARGET_TYPE.LENDING, ACTION_TYPE.LEND_DEPOSIT);
              action.params = {
                mint,
                amountDecimal: amountDecimals,
                tokenAccountId: toTokenAccount.id
              };
              action.confirmed();
              em.persist(action);
            }
          }
        }
        // await this.em.persistAndFlush(toAcctTx);
        await this.em.persistAndFlush(toTokenAccount);
        return true;
      }
    } else {
      return false;
    }
  }

  async processParsedTx(tx: ParsedTransactionWithMeta): Promise<BlockTx> {
    return await this.em.transactional(async (em) => {
        const txid = tx.transaction.signatures[0];
        // see if we've processed this tx before
        const existingTx = await em.findOne(BlockTx, { txid });
        if (existingTx) {
          // skip this guy - already processed
          this.logger.debug(`skipping synced tx: ${tx.transaction.signatures[0]}`);
          existingTx;
        }

        // create the blocktx record
        const blockTx = await this.solanaDbService.createDbTx(tx);

        // look for any action that points to this tx and fill in the blocktx (note: later might be multiple actions)
        const action = await em.findOne(Action, { txid: txid }, { populate: ["accountTransactions"] });
        let isFunding = false;
        let knownTx = false;
        if (action) {
          if (!action.blockTx) {
            action.sync(blockTx);
            em.persist(action);
            knownTx = true;
          }
          if (action.actionType === ACTION_TYPE.FUNDING) {
            // found a funding action for this txid. mark as funding
            isFunding = true;
          } else if (action.actionType === ACTION_TYPE.PAYMENT) {
          }
        }

        if (!knownTx) {
          // then see if this tx was initiated by us
          const foundTx = await em.findOne(RebelTx, { txid: txid });
          if (foundTx) {
            knownTx = true;
          }
        }


        // go through all the inner instructions (for when the lending protocol is involved), and find the token transfers
        for (const innerInstruction of tx.meta.innerInstructions) {
          for (const parsedInnerInstruction of innerInstruction.instructions) {
            if (this.isTransferIx(parsedInnerInstruction)) {
              // find out if the transfer is to/from a tokenaccount we care about
              await this.processTransferIx(tx, parsedInnerInstruction, blockTx, isFunding, knownTx, em, action);
            }
          }
        }

        // now go through the other instructions
        for (const instruction of tx.transaction.message.instructions) {
          if (this.isTransferIx(instruction)) {
            await this.processTransferIx(tx, instruction, blockTx, isFunding, knownTx, em, action);
          }
        }

        return blockTx;
      }
    );
  }


}
