import { Injectable, Logger } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { SystemService } from "./system.service";
import { UserDto } from "../dto/dto.types";

@Injectable()
export class AbstractService {
  protected readonly logger: Logger;

  protected readonly em: EntityManager;
  protected readonly orm: MikroORM;
  protected readonly factoryService: FactoryService;
  protected readonly userRepository: UserRepository;
  protected readonly systemService: SystemService;

  constructor(
    loggerName: string,
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService
  ) {
    this.logger = new Logger(loggerName);
    this.factoryService = factoryService;
    this.em = em;
    this.orm = orm;
    this.userRepository = userRepository;
    this.systemService = systemService;
  }

  async getSystemUser() {
    return await this.em.transactional(async em => {
      return await this.userRepository.getSystemUser();
    });
  }

  async getUserDto(userId: number) {
    return await this.em.transactional(async em => {
      const user = await this.userRepository.getById(userId);
      const systemInfo = await this.systemService.getSystemInfo();
      return new UserDto(user, systemInfo.savingsRate);
    });
  }

}
