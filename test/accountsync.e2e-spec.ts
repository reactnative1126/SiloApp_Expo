import { CommonModule } from "../src/common/common.module";
import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { ConsoleLogger, INestApplication, Logger } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ApiModule } from "../src/api/api.module";
import { FactoryService } from "../src/common/service/factory.service";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "../src/db/db.module";
import { AnalyticsModule } from "../src/analytics/analytics.module";
import { SolanaModule } from "../src/solana/solana.module";
import { UserService } from "../src/api/service/user.service";
import { SplTokenSync } from "../src/solana/sync/spltoken.sync";
import { User } from "../src/db/models/User";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { getRandomInt, makeId } from "../src/common/utils/testing";
import { TokenAccount } from "../src/db/models/TokenAccount";
import { TokenRepository } from "../src/db/repositories/token.repository";
import { Token } from "../src/db/models/Token";
import { ActionProcessorService } from "../src/api/service/actionProcessor.service";
import { AccountSync } from "../src/solana/sync/account.sync";
import { Currency } from "../src/db/models/Currency";


describe("TokenAccount Sync Test", () => {

  const logger = new Logger("TokenAccountSyncTest");

  let app: INestApplication;

  let userService: UserService;
  let actionService: ActionProcessorService;
  let factoryService: FactoryService;
  let accountSync: AccountSync;
  let em: EntityManager;
  let orm: MikroORM;
  let tokenRepository: TokenRepository;
  let usdcToken: Token;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envFilePath: ".env.test",
            isGlobal: true
          }),
          CommonModule,
          AnalyticsModule,
          SolanaModule,
          ApiModule,
          MikroOrmModule.forRoot(),
          DbModule
        ],
        providers: [FactoryService]
      })
      .setLogger(new ConsoleLogger())
      .compile();

    app = module.createNestApplication();
    await app.init();

    userService = module.get(UserService);
    factoryService = module.get(FactoryService);
    actionService = module.get(ActionProcessorService);
    accountSync = module.get(AccountSync);
    em = module.get(EntityManager);
    orm = module.get(MikroORM);
    tokenRepository = module.get(TokenRepository);
    usdcToken = await em.transactional(async (em: EntityManager) => {
      return tokenRepository.findByMint(factoryService.getUsdcMint());
    });
  });

  async function createUser(): Promise<User> {
    const user = await em.transactional(async (em: EntityManager) => {
      const usdCurrency = await em.findOneOrFail(Currency, { code: "USD"});
      let username = faker.person.firstName().toLowerCase() + '_' + faker.person.lastName().toLowerCase() + getRandomInt(1, 9000);
      let email = makeId(5) + "@example.com";
      let user = new User(email, username, faker.person.firstName(), faker.person.lastName(), usdCurrency);
      user.emailConfirmed = true;
      user.initUser();
      await em.persist(user);
      return user;
    });
    logger.debug(`created user: ${user.email} (${user.id})`);
    return user;
  }

  // Call the function to create a user
  // const createdUser = await createUser();


  // it.skip("should sync token accounts", async () => {
  it("should sync token accounts", async () => {
    logger.debug(">>>>> testing token sync");
    // create test user
    const user = await createUser();

    // create the action
    await userService.activateUser(user.id);

    // process actions
    await actionService.processConfirmedActions();

    // sync the token accounts
    await accountSync.syncTokenAccounts(factoryService.getUsdcMint());

    logger.debug(">>>>> testing token sync done");

    // todo: proper test: check balances & shit
  });

});
