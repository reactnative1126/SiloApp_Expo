import { MikroORM, QueryOrder, UseRequestContext } from "@mikro-orm/core";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";

import { System } from "../../db/models/System";
import { FactoryService } from "../../common/service/factory.service";
import { SystemInfo } from "./service.types";
import { Currency } from "../../db/models/Currency";

import { BugtrackingService } from "../../common/service/bugtracking.service";
import { LoaderService } from "../../_loader/service/loader.service";
import { CurrencyDto, ExchangeRateDto, FeedbackDto } from "../dto/dto.types";
import { Feedback } from "../../db/models/Feedback";
import { UserRepository } from "../../db/repositories/user.repository";
import { FriendlyException } from "../controller/exception/friendly.exception";

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  @InjectRepository(System)
  private readonly systemRepository: EntityRepository<System>;

  @InjectRepository(Currency)
  private readonly currencyRepository: EntityRepository<Currency>;

  @InjectRepository(Feedback)
  private readonly feedbackRepository: EntityRepository<Feedback>;

  constructor(
    private readonly orm: MikroORM,
    private readonly factoryService: FactoryService,
    private readonly userRepository: UserRepository
  ) {
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log("system service initialized...");
    await this.refreshSystemInfo();
  }

  @UseRequestContext()
  async isShutdown(): Promise<boolean> {
    return false;
    // shutdown = true means system is shutting down
    /*
    let system = await this.systemRepository.findOne({ property: 'shutdown' });
    return system.value !== 'false';
     */
  };

  @UseRequestContext()
  async getSystemInfo(): Promise<SystemInfo> {
    let system = await this.systemRepository.findOne({ property: "SAVINGS_RATE" });
    const savingsRate = parseFloat(system.value);
    return {
      savingsRate
    };
  }

  @UseRequestContext()
  async refreshSystemInfo(): Promise<any> {
    let usdcReserve = this.factoryService.getSolendUsdcReserve();
    if (usdcReserve == null) {
      usdcReserve = await this.factoryService.populateSolendUsdcReserve();
    }
    let savingsRate = await this.systemRepository.findOne({ property: "SAVINGS_RATE" });
    const rate = (usdcReserve.stats?.supplyInterestAPY * 100).toFixed(2);
    if (!savingsRate) {
      savingsRate = new System("SAVINGS_RATE", rate);
    } else {
      savingsRate.value = rate;
    }
    await this.systemRepository.persistAndFlush(savingsRate);
  }

  @UseRequestContext()
  async getCurrencies(): Promise<CurrencyDto[]> {
    const currencies = await this.currencyRepository.findAll({ orderBy: { name: QueryOrder.ASC } });
    return currencies.map((currency) => new CurrencyDto(currency));
  }

  @UseRequestContext()
  async getExchangeRate(currencyCode: string): Promise<ExchangeRateDto> {
    const currency = await this.currencyRepository.findOne({ code: currencyCode });
    if (!currency) {
      throw new FriendlyException(`Currency ${currencyCode} not found`);
    } else {
      return {
        currencyCode: currency.code,
        exchangeRate: currency.usdExchangeRate
      };
    }
  }

  @UseRequestContext()
  async getExchangeRateForUser(userId: number): Promise<ExchangeRateDto> {
    const user = await this.userRepository.getById(userId);
    return {
      currencyCode: user.currency.code,
      exchangeRate: user.currency.usdExchangeRate
    };
  }

  @UseRequestContext()
  async submitFeedback(userId: number, feedbackDto: FeedbackDto) {
    const user = await this.userRepository.getById(userId);
    const feedback = new Feedback(user, feedbackDto.rating, feedbackDto.comment);
    await this.feedbackRepository.persistAndFlush(feedback);
    return feedback;
  }
}
