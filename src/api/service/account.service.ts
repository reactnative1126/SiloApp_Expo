import { MikroORM, QueryOrder, UseRequestContext } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { ConfigService } from "@nestjs/config";
import { TokenAccountDto, UserDto } from "../dto/dto.types";
import { TokenAccount } from "../../db/models/TokenAccount";
import { SystemService } from "./system.service";
import { FriendlyException } from "../controller/exception/friendly.exception";

@Injectable()
export class AccountService extends AbstractService {

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly configService: ConfigService,
  ) {
    super(AccountService.name, em, orm, factoryService, userRepository, systemService);
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("account service initialized...");
  }

  // gets all the token account transactions for a user's token account (e.g. USDC)
  @UseRequestContext()
  async getUserAccountTransactions(userId: number, currencySymbol: string): Promise<TokenAccountDto> {
    // const user = await this.userRepository.getById(userId);
    // const token = await this.tokenRepository.findBySymbol(currencySymbol);
    const tokenAccount = await this.em.findOne(TokenAccount,
      {user: {id: userId}, token: {symbol: currencySymbol}},
      {populate: ['transactions.currencyAmount.currency', 'token', 'user.currency']}
      );
    // const accountTransactions = await this.em.findOne(AccountTx,
    //   {tokenAccount: {user: {id: userId}, token: {symbol: currencySymbol}}},
    //   {orderBy: {createdAt: QueryOrder.DESC}}
    // );
    if (tokenAccount) {
      return new TokenAccountDto(tokenAccount,  true);
    } else {
      this.logger.warn(`couldn't find token account for user ${userId} and symbol ${currencySymbol}`);
      // throw new FriendlyException(`Couldn't find token account for user ${userId} and symbol ${currencySymbol}`);
      // for now we'll just return empty array instead of throwing an exception
      return {
        id: null,
        transactions: [],
        balance: 0,
        balanceCurrency: 0,
        token: null
      }
    }
  }


}
