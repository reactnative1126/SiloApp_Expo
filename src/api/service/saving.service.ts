import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";

import { System } from "../../db/models/System";

@Injectable()
export class SavingService {
  private readonly logger = new Logger(SavingService.name);

  @InjectRepository(System)
  private readonly systemRepository: EntityRepository<System>;

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService
  ) {
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("SavingService initialized...");
  }

}
