import { MikroORM, QueryOrder, UseRequestContext } from "@mikro-orm/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";

import { Country } from "../../db/models/Country";
import { Currency } from "../../db/models/Currency";
import { InflationData } from "../../db/models/InflationData";

import axios from "axios";
import { BugtrackingService } from "../../common/service/bugtracking.service";
import { readCsvSync } from "../../utils/misc";

interface ExchangeRates {
  [key: string]: number;
}

@Injectable()
export class LoaderService {
  private readonly logger = new Logger(LoaderService.name);

  @InjectRepository(Country)
  private readonly countryRepository: EntityRepository<Country>;

  @InjectRepository(Currency)
  private readonly currencyRepository: EntityRepository<Currency>;

  private exchangeRatesApikey: string;
  private enableExchangeRatesFetch: boolean;

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
    private readonly bugtrackingService: BugtrackingService
  ) {
    this.exchangeRatesApikey = configService.get("EXCHANGERATES_APIKEY");
    this.enableExchangeRatesFetch = configService.get("ENABLE_EXCHANGERATES") === "true";
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    await this.loadCountryInflationData();
    await this.loadExchangeRates();
    // populate the system table w/current savings rate
    this.logger.log("loader service initialized...");
  }

  async loadExchangeRates() {
    if (!this.enableExchangeRatesFetch) {
      this.logger.debug(`exchange rates fetch disabled`);
      return;
    }
    try {
      const exchangeRatesResponse = await axios.get(`http://api.exchangeratesapi.io/v1/latest?access_key=${this.exchangeRatesApikey}`);
      // special case for argentina
      const blueRatesResponse = await axios.get("https://api.bluelytics.com.ar/v2/latest");

      if (exchangeRatesResponse.status === 200 && blueRatesResponse.status == 200) {
        const exchangeRateData = exchangeRatesResponse.data;
        const blueRatesData = blueRatesResponse.data;
        const blueExchangeRate = blueRatesData["blue"].value_avg;

        // get the usd rate
        const usdRate = exchangeRateData.rates["USD"];
        const usdBaseRates: ExchangeRates = {};

        for (const [countryCode, rate] of Object.entries(exchangeRateData.rates)) {
          // @ts-ignore
          usdBaseRates[countryCode] = rate / usdRate;
        }
        // now get all the countries to update them
        const currencies = await this.currencyRepository.findAll();
        for (const currency of currencies) {
          let usdRate = usdBaseRates[currency.code];
          if (currency.code === "ARS") {
            usdRate = blueExchangeRate;
          }
          if (usdRate) {
            currency.usdExchangeRate = usdRate;
            this.currencyRepository.persist(currency);
          } else {
            this.logger.error(`Failed to find exchange rate for currency: ${currency.code}`);
          }
        }
        await this.countryRepository.flush();
      } else {
        this.logger.error(`Failed to fetch data: ${exchangeRatesResponse.status} ${exchangeRatesResponse.statusText}`);
        this.logger.error(`Or failed to fetch blue rate data: ${blueRatesResponse.status} ${blueRatesResponse.statusText}`);
        this.bugtrackingService.notify(new Error(`Failed to fetch exchange rate data: ${exchangeRatesResponse.status} ${exchangeRatesResponse.statusText}`));
      }
    } catch (error) {
      this.bugtrackingService.notify(error);
    }
  }

  async loadCountryInflationData(): Promise<any> {
    // see if we have any country rows
    const countries = await this.countryRepository.findAll();
    if (countries.length === 0) {
      this.logger.debug("loading country inflation data...");
      // populate from csv

      const currencies = {};
      const countryCurrencyCode = {};
      const countries = [];

      const fileInflationData = await readCsvSync("./data/global_inflation_data_subset.csv");
      for (const row of fileInflationData) {
        const currencyCode = row["Currency Code"]?.trim();
        if (!currencyCode) {
          continue;
        }
        let currency = currencies[currencyCode];
        if (!currency) {
          currency = new Currency(row["Currency Code"].trim(), row["Currency"].trim(), row["Emoji"], row['Locale'].trim(), parseInt(row['Decimals'].trim()));
          currencies[currencyCode] = currency;
        }
        let country = new Country(row["Country"].trim(), row["Country Code"].trim());
        countryCurrencyCode[country.countryCode] = currencyCode;
        for (let year = 2000; year <= 2022; year++) {
          if (!row[year.toString()]) {
            continue;
          }
          const inflationData = new InflationData(year, parseFloat(row[year.toString()]), country);
          country.addInflationData(inflationData);
        }
        countries.push(country);
      }

      for (let currencyCode of Object.keys(currencies)) {
        const currency = currencies[currencyCode];
        if (!currency.id) {
          await this.currencyRepository.persistAndFlush(currencies[currencyCode]);
        }
      }
      for (const country of countries) {
        country.currency = currencies[countryCurrencyCode[country.countryCode]];
        this.countryRepository.persist(country);
      }
      await this.countryRepository.flush();
    }
  }

}
