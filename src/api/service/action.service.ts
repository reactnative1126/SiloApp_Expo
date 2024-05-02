import { MikroORM, QueryOrder, UseRequestContext } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { ConfigService } from "@nestjs/config";
import { Action } from "../../db/models/Action";
import { ACCOUNT_TX_ACTION_TYPE, ACTION_STATUS, ACTION_TARGET_TYPE, ACTION_TYPE } from "../../db/db.types";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { TransactionService } from "./transaction.service";
import { UserDto } from "../dto/dto.types";
import { UserService } from "./user.service";
import { EmailService } from "./email.service";
import { EmailType } from "../../db/models/EmailRecord";
import { SystemService } from "./system.service";

@Injectable()
export class ActionService extends AbstractService {

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly configService: ConfigService,
  ) {
    super(ActionService.name, em, orm, factoryService, userRepository, systemService);
  }

  async onModuleInit(): Promise<any> {
    this.logger.log("ActionService initialized...");
  }

  @UseRequestContext()
  async createAction() {

  }


}
