import { MikroORM, QueryOrder, UseRequestContext } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { SolanaService } from "../../solana/solana.service";
import { TokenRepository } from "../../db/repositories/token.repository";
import { ConfigService } from "@nestjs/config";
import { Action } from "../../db/models/Action";
import {
  ACTION_STATUS,
  ACTION_TARGET_TYPE,
  ACTION_TYPE,
  AccountTxType,
  ACCOUNT_TX_ACTION_TYPE
} from "../../db/db.types";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { TransactionService } from "./transaction.service";
import { UserDto } from "../dto/dto.types";
import { UserService } from "./user.service";
import { EmailService } from "./email.service";
import { EmailType } from "../../db/models/EmailRecord";
import { SystemService } from "./system.service";
import { TokenAccount } from "../../db/models/TokenAccount";
import { TransferService } from "./transfer.service";
import { Paylink } from "../../db/models/Paylink";

@Injectable()
export class ActionProcessorService extends AbstractService {

  private usdcMint: PublicKey;
  private initialSolFundAmountDecimal: number;
  private initialUsdcFundAmountDecimal: number;

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly userService: UserService,
    readonly transferService: TransferService,
    readonly configService: ConfigService,
    readonly tokenRepository: TokenRepository,
    readonly solanaService: SolanaService,
    readonly transactionService: TransactionService,
    readonly emailService: EmailService
  ) {
    super(ActionProcessorService.name, em, orm, factoryService, userRepository, systemService);
    this.initialSolFundAmountDecimal = parseFloat(configService.get("SOL_FUND_AMOUNT"));
    this.usdcMint = this.factoryService.getUsdcMint();
    this.initialUsdcFundAmountDecimal = parseFloat(configService.get("USDC_FUND_AMOUNT"));
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("action service initialized...");
  }

  async confirmAction(userId: number, actionId: number): Promise<UserDto> {
    return await this.em.transactional(async em => {
      const action = await this.em.findOneOrFail(Action,
        { id: actionId },
        { populate: ["user.accounts.token", "user.accounts.transactions", "user.currency"] });
      if (action.user.id != userId) {
        throw new Error(`Authorization error!`);
      }
      // make sure this action can be confirmed
      if (action.status !== ACTION_STATUS.CREATED) {
        // todo: remove geek speak after debugging
        throw new Error(`Action cannot be confirmed. Current status: ${action.status}`);
      }

      // update the balance(s) to reflect pending amounts

      // right now, just handle payment to wallet address
      const params = action.params;
      const mintSymbol = params["mintSymbol"];
      const amount = action.amount;     // or can get it from params['amountDecimal']
      const token = await this.tokenRepository.findBySymbol(mintSymbol);

      const user = action.user;
      if (action.actionType === ACTION_TYPE.PAYMENT) {
        const debitAccountTx = user.addPendingDebit(token, amount, ACCOUNT_TX_ACTION_TYPE.PAYMENT, action.target, user.currency);
        debitAccountTx.action = action;
      }

      // now confirm status so it gets processed
      action.status = ACTION_STATUS.CONFIRMED;

      let paylink = null;
      // todo: this is special code for immediately generating the paylink (to get returned in the confirm action response)
      //       if the action is to create a paylink, we'll create it immediately here and populate the action with the id
      if (action.targetType === ACTION_TARGET_TYPE.PAYLINK) {
        paylink = await this.transferService.createPaylink(action.user.id, mintSymbol, amount);
        action.target = paylink.id.toString();
      }

      this.em.persist(action);
      this.em.persist(user);
      const systemInfo = await this.systemService.getSystemInfo();
      const userDto = await this.getUserDto(user.id);
      if (paylink) {
        userDto.message = `Here is your $${action.amount.toFixed(2)} paylink: ${this.factoryService.createPaylinkUrl(paylink)}`;
      }
      return userDto;
    });
  }

  async processConfirmedActions() {
    const actionIds = await this.em.transactional(async em => {
      const actions = await em.find(Action, {
        status: ACTION_STATUS.CONFIRMED,
        user: { status: "ACTIVE" },
        $or: [{
          processAfter: null
        }, {
          processAfter: { $lte: new Date() }
        }]
      }, { orderBy: { createdAt: QueryOrder.ASC } });
      return actions.map(a => a.id);
    });
    for (const actionId of actionIds) {
      await this.processAction(actionId);
    }
  }

  private async checkAndUpdateStatus(actionId: number, expectedStatus: string, newStatus: string, error: string = null) {
    return await this.em.transactional(async em => {
      const action: Action = await em.findOneOrFail(Action, { id: actionId }, { populate: ["targetUser", "user.currency", "accountTransactions", "targetUser.invitedBy"] });
      if (action.status !== expectedStatus && action.status !== ACTION_STATUS.SYNCED) {
        // action could've gottend synced during processing by the syncer job
        throw new Error(`cannot update action ${actionId} status ${action.status}: is not expected status: ${expectedStatus}`);
      } else {
        action.status = newStatus;
        if (error) {
          action.error = error;
        }
        // this needs to be updated immediately when the tx gets submitted
        // if (txid) {
        //   action.txid = txid;
        // }
        await em.persistAndFlush(action);
      }
      return action;
    });

  }

  async processAction(actionId: number) {
    // mark as processing
    const action = await this.checkAndUpdateStatus(actionId, ACTION_STATUS.CONFIRMED, ACTION_STATUS.PROCESSING);

    let updateStatus = ACTION_STATUS.PROCESSED;
    let error = null;
    let txid = null;

    const actionParams = action.params;

    let amountDecimal = null;
    let initWallet = null;
    let targetUser = null;
    let tokenAccountId = null;
    let mint = null;
    let toWallet: PublicKey | null = null;
    let paylink: Paylink | null = null;

    try {
      switch (action.actionType) {
        case ACTION_TYPE.LEND_DEPOSIT:
          amountDecimal = actionParams["amountDecimal"];
          tokenAccountId = actionParams["tokenAccountId"];
          mint = new PublicKey(actionParams["mint"]);

          // make a deposit into lending
          txid = await this.transactionService.depositIntoLending(action.user, mint, amountDecimal, action);
          // send email notifying of the deposit
          const emailData = await this.em.transactional(async em => {
            const systemInfo = await this.systemService.getSystemInfo();
            const tokenAccount = await this.em.findOne(TokenAccount, { id: tokenAccountId });
            return {
              depositAmount: amountDecimal.toFixed(2),
              interestRate: systemInfo["savingsRate"],
              savingsAmount: tokenAccount.balance.toFixed(2),
              earnAmount: tokenAccount.balance * (systemInfo["savingsRate"] / 100)
            };
          });
          await this.emailService.createEmail(action.user.getName(), action.user.email, EmailType.DEPOSIT_RECEIVED, "Your RebelFi deposit has been received!", emailData);
          break;

        case ACTION_TYPE.FUNDING:

          amountDecimal = actionParams["amountDecimal"];
          initWallet = actionParams["initWallet"];
          targetUser = action.targetUser;
          mint = new PublicKey(actionParams["mint"]);

          let tx: Transaction | null = null;
          if (initWallet) {
            // init the wallet with a bit of sol - enough for a few transactions
            const toWallet = new PublicKey(targetUser.walletAddress);
            tx = await this.solanaService.sendSolTx(toWallet, this.initialSolFundAmountDecimal);
            this.logger.debug(`Wallet initialized for user ${targetUser.id}. Sent ${this.initialSolFundAmountDecimal} sol to ${toWallet.toBase58()} txid: ${tx.signature}`);
          } else {
            tx = new Transaction();
          }

          // next, send in the usdc -> to savings account
          const systemUser = await this.getSystemUser();
          // txid = await this.transactionService.sendPaymentToUser(systemUser, targetUser, mint, amountDecimal);
          txid = await this.transactionService.fundUser(systemUser, targetUser, mint, amountDecimal, tx, action);

          if ("fundingType" in actionParams) {
            if (actionParams["fundingType"] === "welcome") {
              this.logger.debug(`Sending welcome email to user ${targetUser.id}`);
              // now email the new user
              await this.emailService.createEmail(targetUser.getName(), targetUser.email, EmailType.WELCOME,
                `Welcome to RebelFi!`,
                {
                  name: targetUser.getName(),
                  fundAmount: amountDecimal.toFixed(2)
                });
            } else if (actionParams["fundingType"] == "invite-bonus") {
              this.logger.debug(`Sending invite deposit bonus email to user ${targetUser.id}`);
              // now email the new user
              await this.emailService.createEmail(targetUser.name, targetUser.email, EmailType.INVITE_BONUS,
                `You've earned a deposit bonus on RebelFi!`,
                {
                  name: targetUser.getName(),
                  invitee: actionParams["invitee"],
                  fundAmount: amountDecimal.toFixed(2)
                });
            }
          }

          if (targetUser.invitedBy) {
            this.logger.debug(`creating bonus deposit action for inviter ${targetUser.id}, for inviting ${targetUser.id}`);
            const inviter = targetUser.invitedBy;
            await this.em.transactional(async em => {
              // then we need to send a bonus to the inviter
              const inviteBonusAction = new Action(systemUser, inviter.id.toString(), ACTION_TARGET_TYPE.USER, ACTION_TYPE.FUNDING);
              inviteBonusAction.targetUser = inviter;
              const bonusAmount = this.initialUsdcFundAmountDecimal / 2; // todo: make this configurable
              inviteBonusAction.amount = bonusAmount;
              inviteBonusAction.params = {
                amountDecimal: bonusAmount,
                mint: this.usdcMint.toBase58(),
                initWallet: true,
                fundingType: "invite-bonus",
                invitee: targetUser.name
              };
              inviteBonusAction.status = ACTION_STATUS.CONFIRMED;
              await this.em.persistAndFlush(inviteBonusAction);
            });
          }

          break;
        case ACTION_TYPE.PAYMENT:
          amountDecimal = actionParams["amountDecimal"];
          const mintSymbol = actionParams["mintSymbol"];
          const token = await this.em.transactional(async em => {
            return await this.tokenRepository.findBySymbol(mintSymbol);
          });
          mint = new PublicKey(token.mint);
          let newUser = null;
          switch (action.targetType) {
            case ACTION_TARGET_TYPE.EMAIL:
              // set up a new user + contact for this email then
              newUser = await this.userService.createInvitedUser(action.user, action.target);
              toWallet = new PublicKey(newUser.walletAddress);
              break;
            case ACTION_TARGET_TYPE.USER:
              targetUser = action.targetUser;
              toWallet = new PublicKey(targetUser.walletAddress);
              break;
            case ACTION_TARGET_TYPE.WALLET:
              toWallet = new PublicKey(action.target);
              break;
            case ACTION_TARGET_TYPE.PAYLINK:
              if (action.target === "paylink") {
                paylink = await this.transferService.createPaylink(action.user.id, mint.toBase58(), amountDecimal);
              } else {
                // then the paylink was already generated
                paylink = await this.em.transactional(async em => {
                  return em.findOneOrFail(Paylink, { id: parseInt(action.target) });
                });
              }
              toWallet = new PublicKey(paylink.walletAddress);
              break;
            default:
              throw new Error(`unknown action type ${action.actionType}`);
          }

          // now send the usdc
          const initiator = action.user;
          // todo: remove this wallet check later when fraud-handling is better
          if (action.target !== "8hVb3kunjQTrz3fPw89JqEgaBN7FRRSkg2LNvkxv8AR4") {
            txid = await this.transactionService.sendPaymentToWallet(initiator, toWallet, mint, amountDecimal, action, !!paylink);
          } else {
            updateStatus = ACTION_STATUS.FRAUD;
          }
          await this.em.transactional(async em => {
            const fromTokenAccount = await this.em.findOne(TokenAccount, {
              user: initiator.id,
              token: { id: token.id }
            });
            // send an email to the sender notifying them payment has been processed
            if (!paylink) {
              await this.emailService.createEmail(null, action.user.email, EmailType.PAYMENT_SENT,
                `Your RebelFi payment has been processed`,
                {
                  recipient: action.target,
                  paymentAmount: amountDecimal.toFixed(2),
                  balance: fromTokenAccount.balance.toFixed(2)
                });
            } else {
              // update the paylink status
              paylink.funded();
              em.persist(paylink);
              // paylink email
              await this.emailService.createEmail(null, action.user.email, EmailType.PAYLINK_CREATED,
                `Your RebelFi paylink has been created`,
                {
                  paymentAmount: amountDecimal.toFixed(2),
                  balance: fromTokenAccount.balance.toFixed(2),
                  paylink: this.factoryService.createPaylinkUrl(paylink)
                });
            }
            // send an email to the new user if there is one
            if (newUser) {
              // todo: make sure this user was newly invited first and handle if he wasn't
              // the debit is taken when the initiator creates the payment
              newUser.addPendingCredit(token, amountDecimal, ACCOUNT_TX_ACTION_TYPE.RECEIPT, action.user.getName(), true);
              em.persist(newUser);
              // now email the invitee
              await this.emailService.createEmail(null, newUser.email, EmailType.USER_INVITE_WITH_FUNDS,
                `${action.user.getName()} has sent you funds on RebelFi!`,
                {
                  sender: action.user.getName(),
                  paymentAmount: amountDecimal.toFixed(2),
                  rebelfiUrl: this.configService.get("BASE_MAINFI_URL"),
                  fundAmount: this.initialUsdcFundAmountDecimal.toFixed(2)
                });
            }
          });
          break;
        case ACTION_TYPE.PAYLINK_PAYMENT:
          const paylinkId = actionParams['paylinkId'];
          await this.transactionService.disbursePaylink(paylinkId, action);
          break;
        default:
          throw new Error(`unknown action type ${action.actionType}`);
      }
    } catch (err) {
      this.logger.error(`error processing action ${actionId}: ${err}`);
      error = err.stack;
      updateStatus = ACTION_STATUS.ERROR;
    }

    // update status
    await this.checkAndUpdateStatus(actionId, ACTION_STATUS.PROCESSING, updateStatus, error);
  }

}
