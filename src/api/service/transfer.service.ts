import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Paylink } from "../../db/models/Paylink";
import { IdType, PaylinkDto, PaymentDto, PayTargetDto } from "../dto/dto.types";
import { FriendlyException } from "../controller/exception/friendly.exception";
import {
  ACTION_STATUS,
  ACTION_TARGET_TYPE,
  ACTION_TYPE,
  PAYLINK_STATUS,
  PayTargetRequestDto,
  PayTargetType
} from "../../db/db.types";
import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { SystemService } from "./system.service";
import { UserService } from "./user.service";
import { TokenAccountRepository } from "../../db/repositories/tokenaccount.repository";
import { ActionService } from "./action.service";
import { Transfer } from "../../db/models/Transfer";
import { Action } from "../../db/models/Action";

import { TokenRepository } from "../../db/repositories/token.repository";
import { UserRepository } from "../../db/repositories/user.repository";
import { ContactRepository } from "../../db/repositories/contact.repository";
import { SolanaAddressRepository } from "../../db/repositories/solanaaddress.repository";
import { TransferRepository } from "../../db/repositories/transfer.repository";
import { Currency } from "../../db/models/Currency";

@Injectable()
export class TransferService extends AbstractService {

  @InjectRepository(Paylink)
  private readonly paylinkRepository: EntityRepository<Paylink>;

  @InjectRepository(Currency)
  private readonly currencyRepository: EntityRepository<Currency>;

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly configService: ConfigService,
    readonly tokenRepository: TokenRepository,
    readonly tokenAccountRepository: TokenAccountRepository,
    readonly contactRepository: ContactRepository,
    readonly userService: UserService,
    readonly transferRepository: TransferRepository
  ) {
    super(TransferService.name, em, orm, factoryService, userRepository, systemService);
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("PaymentService initialized...");
  }

  @UseRequestContext()
  async createPaylink(createdById: number, tokenSymbol: string, amount: number) {
    const user = await this.userRepository.findById(createdById);
    const token = await this.tokenRepository.findOneOrFail({ symbol: tokenSymbol });
    const paylink = new Paylink(user, token, amount);
    await this.paylinkRepository.persistAndFlush(paylink);
    return paylink;
  }

  @UseRequestContext()
  async getUnclaimedPaylink(claimCode: string) {
    const paylink = await this.paylinkRepository.findOne({
      claimCode,
      claimedAt: null,
      status: PAYLINK_STATUS.FUNDED
    }, { populate: ["createdBy", "token"] });
    if (paylink) {
      return new PaylinkDto(paylink);
    } else {
      throw new FriendlyException("Invalid claim code.");
    }
  }

  @UseRequestContext()
  async claimPaylink(userId: number, claimCode: string) {
    const paylink = await this.paylinkRepository.findOne({
      claimCode,
      claimedAt: null,
      status: PAYLINK_STATUS.FUNDED
    }, { populate: ["createdBy", "token"] });
    if (!paylink) {
      throw new FriendlyException("Invalid claim code. Unknown paylink.");
    } else {
      const claimer = await this.userRepository.getById(userId);
      // mark the paylink as claimed and create the action to disburse it
      paylink.claim(claimer);
      const action = new Action(claimer, claimer.id.toString(), ACTION_TARGET_TYPE.USER, ACTION_TYPE.PAYLINK_PAYMENT);
      action.status = ACTION_STATUS.CONFIRMED;      // process immediately
      action.params = {
        paylinkId: paylink.id
      };
      await this.paylinkRepository.persistAndFlush(action);
      // todo: update token balances and shit so balance changes immediately
      return await this.getUserDto(userId);
    }
  }

  // payment logic:
  // - verify that the user has the funds
  // - create a Transfer object to later process the transfer (payment)
  // - create a PendingDebit for the paying TokenAccount to "lock" the funds
  @UseRequestContext()
  async createTransfer(userId: number, paymentDto: PaymentDto): Promise<Transfer> {
    const user = await this.userRepository.getById(userId);
    let currencyCode = paymentDto.currency ?? "USD";
    const currency = await this.currencyRepository.findOne({code: currencyCode});
    if (!currency) {
      throw new FriendlyException(`Invalid currency: ${paymentDto.currency}.`);
    }
    if (!paymentDto.amount || paymentDto.amount <= 0) {
      throw new FriendlyException(`Invalid payment amount.`);
    }
    const usdcAmount = paymentDto.amount * currency.usdExchangeRate;
    const usdcTokenAccount = await this.tokenAccountRepository.getUsdcAccount(userId);
    if (!usdcTokenAccount) {
      this.logger.error(`User ${userId} does not have a USDC account.`);
      // shouldn't happen
      throw new FriendlyException(`Your USDC account has not been set up yet.`);
    }
    if (!paymentDto.targetType || !paymentDto.targetId) {
      throw new FriendlyException(`Transfer recipient not specified.`);
    }
    const token = usdcTokenAccount.token;
    // couple checks: db
    if (!usdcTokenAccount.hasBalance(usdcAmount)) {
      throw new FriendlyException(`Not enough funds! Your USDC balance: ${usdcTokenAccount.balance}`);
    }
    // todo: chain check is a little tricky since we need to check the lending protocol deposit.
    //  for now don't worry and assume balance in db is correct (should be unless there's another action process that's
    //  running at the same time
    usdcTokenAccount.pendingDebit(usdcAmount);
    // now create the transfer object and attach the debit to be updated when the tx is processed
    const transfer = new Transfer(user, usdcTokenAccount, usdcAmount);
    // await this.transferRepository.persistAndFlush(transfer);

    let toUser = null;
    let toTokenAccount = null;
    let fromTokenAccount = null;
    switch (paymentDto.targetType) {
      case PayTargetType.REBELTAG:
        toUser = await this.userRepository.findByRebeltag(paymentDto.targetId as string);
        break;
      case PayTargetType.USER:
        toUser = await this.userRepository.findById(paymentDto.targetId as number);
        break;
      case PayTargetType.CONTACT:
        const contact = await this.contactRepository.findByContactIdForUser(userId, paymentDto.targetId as number);
        if (contact) {
          if (contact.isRebelfiContact()) {
            // toUser = contact.rebelfiContact;
            toUser = await this.userRepository.getById(contact.rebelfiContact.id);
          } else {
            // todo: handle the other types of contacts
            throw new FriendlyException(`Can't handle ${contact.contactType} contacts yet.`);
          }
        }
        break;
      default:
        throw new Error(`Unknown target type: ${paymentDto.targetType}`);
    }

    if (!toUser) {
      throw new FriendlyException("Unknown transfer recipient.");
    }
    // this might be ok for multiple accounts
    // if (toUser.id === user.id) {
    //   throw new FriendlyException("You're transfer to yourself.");
    // }
    fromTokenAccount = user.getTokenAccount(token);
    transfer.setUserTarget(toUser);
    toTokenAccount = toUser.getTokenAccount(token, true);

    if (toTokenAccount.id === fromTokenAccount.id) {
      throw new FriendlyException("You're transferring to the same account.");
    }

    /* old method - will possibly reuse for other types of targets
    if (paymentDto.toWalletAddress) {
      // todo: check if this is a valid solana address
      const address = paymentDto.toWalletAddress.trim();
      const validSolanaAddress = isValidPublicKey(address);
      if (!validSolanaAddress) {
        throw new FriendlyException(`That is not a valid Solana address.`);
      }
      // look up the address
      let solanaAddress = await this.solanaAddressRepository.findByAddress(address);
      if (!solanaAddress) {
        solanaAddress = new SolanaAddress(address, ADDRESS_TYPE.UNKNOWN);
        await this.solanaAddressRepository.persistAndFlush(solanaAddress);
      } else {
        transfer.setSolanaAddressTarget(solanaAddress);
      }
    } else if (paymentDto.toContactId) {
      let contact = await this.contactRepository.findByContactIdForUser(userId, paymentDto.toContactId);
      if (!contact) {
        throw new FriendlyException(`Unknown contact to send payment to.`);
      } else {
        transfer.setContactTarget(contact);
      }
    } else if (paymentDto.toRebelUserId) {
      if (paymentDto.toRebelUserId === userId) {
        // this shouldn't happen
        throw new FriendlyException(`You're making a transfer to yourself.`);
      }
      const rebelUser = await this.userRepository.findById(paymentDto.toRebelUserId);
      if (!rebelUser) {
        throw new FriendlyException(`Can't make transfer. Unknown RebelFi user.`);
      } else {
        transfer.setUserTarget(rebelUser);
        toTokenAccount = rebelUser.getTokenAccount(token, true);
      }
    } else {
      throw new FriendlyException(`Transfer recipient not specified.`);
    }
    */

    // create the token account if it was just created
    if (toTokenAccount && !toTokenAccount.id) {
      await this.tokenAccountRepository.persistAndFlush(toTokenAccount);
    }
    transfer.toTokenAccount = usdcTokenAccount;
    await this.transferRepository.persistAndFlush(transfer);
    return transfer;
  }

  @UseRequestContext()
  async getPayTarget(userId: number, payTargetRequest: PayTargetRequestDto) {
    const user = await this.userRepository.getById(userId);
    let toUser = null;
    switch (payTargetRequest.targetType) {
      case PayTargetType.USER:
        toUser = await this.userRepository.findById(payTargetRequest.targetId as number);
        break;
      case PayTargetType.REBELTAG:
        // if the rebeltag starts w/@, remove it
        const targetIdString = payTargetRequest.targetId as string;
        const rebeltag = targetIdString.startsWith("@") ? targetIdString.substring(1) : targetIdString;
        toUser = await this.userRepository.findByRebeltag(rebeltag);
        break;
      case PayTargetType.CONTACT:
        const contact = await this.contactRepository.findByContactIdForUser(userId, payTargetRequest.targetId as number);
        if (contact) {
          if (contact.isRebelfiContact()) {
            toUser = await this.userRepository.getById(contact.rebelfiContact.id);
          } else {
            this.logger.warn(`Can't handle ${contact.contactType} contacts yet.`);
          }
        }
        break;
      default:
        throw new FriendlyException(`Can't handle target type: ${payTargetRequest.targetType} yet.`);
    }
    if (!toUser) {
      throw new FriendlyException(`Unknown user.`);
    } else {
      const contact = await this.contactRepository.findByContactIdForUser(userId, toUser.id);
      return PayTargetDto.fromUser(toUser, IdType.REBELTAG, !!contact);
    }
  }
}
