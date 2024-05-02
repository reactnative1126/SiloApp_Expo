import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { ConfigService } from "@nestjs/config";
import { SystemService } from "./system.service";


@Injectable()
export class AuthService extends AbstractService {

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly configService: ConfigService,
  ) {
    super(AuthService.name, em, orm, factoryService, userRepository, systemService);
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("AuthService initialized...");
  }
}
