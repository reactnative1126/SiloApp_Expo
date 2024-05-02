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
import { User } from "../src/db/models/User";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { makeId } from "../src/common/utils/testing";
import { TokenRepository } from "../src/db/repositories/token.repository";
import { Token } from "../src/db/models/Token";
import { ActionProcessorService } from "../src/api/service/actionProcessor.service";
import { AccountSync } from "../src/solana/sync/account.sync";
import { Currency } from "../src/db/models/Currency";
import { TransferProcessorService } from "../src/api/service/transferprocessor.service";
import { SolanaClient } from "../src/solana/solanaclient";
import { PayTargetType, TransferStatus, TransferTargetType, USER_STATUS } from "../src/db/db.types";
import { TokenAccountRepository } from "../src/db/repositories/tokenaccount.repository";
import { getMint, Mint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { UserRepository } from "../src/db/repositories/user.repository";
import { TestHelper } from "./util/helpers";
import { TransferService } from "../src/api/service/transfer.service";
import { PaymentDto } from "../src/api/dto/dto.types";


describe("Transfers Test", () => {

  const logger = new Logger("TransfersTest");

  let app: INestApplication;

  let userService: UserService;
  let actionService: ActionProcessorService;
  let transferProcessorService: TransferProcessorService;
  let transferService: TransferService;
  let factoryService: FactoryService;
  let accountSync: AccountSync;
  let em: EntityManager;
  let orm: MikroORM;
  let tokenRepository: TokenRepository;
  let tokenAccountRepository: TokenAccountRepository;
  let userRepository: UserRepository;
  let usdcToken: Token;
  let solanaClient: SolanaClient;
  let usdcMint: PublicKey;
  let usdcMintInfo: Mint;
  let testHelper: TestHelper;

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
    solanaClient = factoryService.solanaClient();
    actionService = module.get(ActionProcessorService);
    tokenAccountRepository = module.get(TokenAccountRepository);
    transferProcessorService = module.get(TransferProcessorService);
    transferService = module.get(TransferService);
    userRepository = module.get(UserRepository);
    accountSync = module.get(AccountSync);
    em = module.get(EntityManager);
    orm = module.get(MikroORM);
    usdcMint = factoryService.getUsdcMint();
    usdcMintInfo = await getMint(solanaClient.getConnection(), usdcMint);
    tokenRepository = module.get(TokenRepository);
    usdcToken = await em.transactional(async (em: EntityManager) => {
      return tokenRepository.findByMint(factoryService.getUsdcMint());
    });
    testHelper = new TestHelper(solanaClient, em, userRepository, usdcMintInfo, tokenAccountRepository, userService);
  });

  async function createUser(): Promise<User> {
    const user = await em.transactional(async (em: EntityManager) => {
      const usdCurrency = await em.findOneOrFail(Currency, { code: "USD" });
      let username = makeId(5);
      let email = makeId(5) + "@example.com";
      let user = new User(email, username, faker.person.firstName(), faker.person.lastName(), usdCurrency);
      user.emailConfirmed = true;
      user.status = USER_STATUS.ACTIVE;
      em.persist(user);
      return user;
    });
    logger.debug(`created user: ${user.email} (${user.id})`);
    return user;
  }

  // Call the function to create a user
  // const createdUser = await createUser();
  let user1 = null;
  let user2 = null;

  // it.skip("should sync token accounts", async () => {
  it("should process transfers", async () => {

    // create test users - fund user1 but not user2
    user1 = await testHelper.createUser();
    user2 = await testHelper.createUser(null, false);

    // check account setup working

    // this creates the action to fund the user - created during reg in test env
    // let action = await userService.fundUser(user, "welcome");

    // process the action to fund user1
    // await actionService.processConfirmedActions();

    let userUsdcTokenAccount = await em.transactional(async em => {
      return await tokenAccountRepository.findByTokenSymbol(user1.id, "USDC");
    });

    expect(userUsdcTokenAccount).toBeDefined();
    expect(userUsdcTokenAccount.balance).toBeGreaterThan(0);
    expect(userUsdcTokenAccount.unsyncedBalance).toBeLessThan(0);  // unsynced credit = > 0

    let balance = userUsdcTokenAccount.balance;

    // process the action to fund user1
    await actionService.processConfirmedActions();

    // now run the account sync - token account should have the same balance, but unsynced should be 0
    // userUsdcTokenAccount = await em.transactional(async em => {
    //   return await accountSync.syncTokenAccount(userUsdcTokenAccount);
    // });
    userUsdcTokenAccount = await accountSync.syncTokenAccount(userUsdcTokenAccount);

    expect(userUsdcTokenAccount).toBeDefined();
    expect(userUsdcTokenAccount.balance).toBeGreaterThan(0);
    expect(userUsdcTokenAccount.balance).toEqual(balance);
    expect(userUsdcTokenAccount.unsyncedBalance).toEqual(0);  // now it's synced
    expect(userUsdcTokenAccount.lastSyncedBlockTx).toBeDefined();

    // now check on-chain shit

    // check: user wallet set up on chain + token account created + populated (balance > 0, since no lending set up on dev)
    let userWallet = user1.publicKey();
    let solBalance = await solanaClient.getSolBalance(userWallet);
    expect(solBalance).toBeGreaterThan(0);

    let usdcBalance = await solanaClient.getTokenBalance(usdcMint, userWallet);

    expect(usdcBalance).toBeDefined();
    expect(usdcBalance).toBeGreaterThan(0);

    // now create a transfer/payment
    let paymentAmount = 0.25;
    let paymentDto: PaymentDto = {
      amount: paymentAmount,
      // currency: "USDC"
      targetType: PayTargetType.USER,
      targetId: user1.id,
      // toRebelUserId: user.id
    };

    // user2 tries to pay 1 (no money)
    let transfer = null;
    try {
      await transferService.createTransfer(user2.id, paymentDto);
      fail('shouldnt be able to transfer funds from emtpy account');
    } catch (err) {
      // expected
      logger.debug(`expected error (cause no funds): ${err}`);
    }

    paymentDto = {
      amount: paymentAmount,
      // currency: "USDC"
      targetType: PayTargetType.USER,
      targetId: user2.id
      // toRebelUserId: user2.id
    };

    // now user 1 pays user2 (0.5)
    transfer = await transferService.createTransfer(user1.id, paymentDto);
    expect(transfer).toBeDefined();
    expect(transfer.processedAt).toBeUndefined();
    expect(transfer.amount).toEqual(paymentAmount);
    expect(transfer.targetType).toEqual(TransferTargetType.USER);
    expect(transfer.status).toEqual(TransferStatus.CREATED);
    expect(transfer.createdAt).toBeDefined();
    expect(transfer.toUser).toBeDefined();
    expect(transfer.toTokenAccount).toBeDefined();
    expect(transfer.fromTokenAccount).toBeDefined();

    // now process the transfer; this does the account sync as well
    await transferProcessorService.processTransfer(transfer.id);

    userUsdcTokenAccount = await em.transactional(async em => {
      return await tokenAccountRepository.findByTokenSymbol(user1.id, "USDC");
    });

    let userBalance = balance - paymentAmount;

    expect(userUsdcTokenAccount.balance).toEqual(userBalance);
    expect(userUsdcTokenAccount.unsyncedBalance).toEqual(0);  // now it's synced

    // check user2's token account
    let user2Balance = paymentAmount;
    let user2UsdcTokenAccount = await em.transactional(async em => {
      return await tokenAccountRepository.findByTokenSymbol(user2.id, "USDC");
    });

    expect(user2UsdcTokenAccount.balance).toEqual(user2Balance);
    expect(user2UsdcTokenAccount.unsyncedBalance).toEqual(0);

    // now check the user wallets
    user2Balance = await solanaClient.getTokenBalance(usdcMint, user2.publicKey());
    userBalance = await solanaClient.getTokenBalance(usdcMint, user1.publicKey());

    expect(user2Balance).toEqual(paymentAmount);
    expect(userBalance).toEqual(balance - paymentAmount);

    logger.debug(">>>>> testing transfers done");
  });


  beforeAll(async () => {
    await em.transactional(async em => {
      // delete all actions
      await em.nativeDelete("action", {});
    });
    logger.debug('deleted all actions...');
  });

  afterAll(async () => {
    if (user1) {
      logger.debug(`tearing down user`);
      await testHelper.drainUser(user1);
      // empty the user's wallet back to system's
    }
    if (user2) {
      logger.debug(`tearing down user2`);
      await testHelper.drainUser(user2);
    }
  });

});
