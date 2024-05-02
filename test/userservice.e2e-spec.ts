import { CommonModule } from "../src/common/common.module";
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
import { User } from "../src/db/models/User";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { getRandomInt, makeId } from "../src/common/utils/testing";
import { RegisterUserDto, SessionDto } from "../src/api/dto/dto.types";
import { faker } from "@faker-js/faker";

describe("UserService Test", () => {

  const logger = new Logger("UserService");

  let app: INestApplication;

  let userService: UserService;
  let factoryService: FactoryService;
  let em: EntityManager;
  let orm: MikroORM;

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
    em = module.get(EntityManager);
    orm = module.get(MikroORM);
  });

  it("should register and authenticate a user", async () => {
    logger.debug(">>>>> testing token sync");

    let username = (faker.person.firstName() + "-" + faker.person.lastName() + faker.number.int(999).toString()).toLowerCase();
    let email = (makeId(5) + "@example.com").toLowerCase();
    let password = 'password' + faker.number.int(999).toString();

    let registerUserDto: RegisterUserDto = {
      username,
      password,
      email
    };
    let sessionDto: SessionDto = await userService.register(registerUserDto);
    expect(sessionDto).toBeDefined();
    expect(sessionDto.authToken).toBeDefined();

    let authToken = sessionDto.authToken;
    let user = await userService.getUserByAuthToken(authToken);
    expect(user).toBeDefined();
    expect(user.email).toEqual(email);
    expect(user.username).toEqual(username);
    expect(user.authToken).toEqual(authToken);

    sessionDto = await userService.login(username, password);
    expect(sessionDto).toBeDefined();
    expect(sessionDto.authToken).toBeDefined();
    // check that the authToken in sessionDto is different from the previous authToken
    expect(sessionDto.authToken).not.toEqual(authToken);

    user = await userService.getUserByAuthToken(authToken);
    expect(user).toBeNull();

    try {
      await userService.login(username, 'notpassword');
    } catch (err) {
      expect(err.message).toContain('not found');
    }
  });

});
