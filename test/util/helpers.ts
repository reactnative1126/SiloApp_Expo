import { User } from "src/db/models/User";
import { SolanaClient } from "../../src/solana/solanaclient";
import { EntityManager } from "@mikro-orm/core";
import { UserRepository } from "../../src/db/repositories/user.repository";
import { Logger } from "@nestjs/common";
import { PublicKey } from "@solana/web3.js";
import { Mint } from "@solana/spl-token";
import { TokenAccountRepository } from "../../src/db/repositories/tokenaccount.repository";
import { Currency } from "../../src/db/models/Currency";
import { makeId } from "../../src/common/utils/testing";
import { faker } from "@faker-js/faker";
import { USER_STATUS } from "../../src/db/db.types";
import { UserService } from "src/api/service/user.service";


export class TestHelper {

  readonly logger: Logger = new Logger("TestHelper");

  solanaClient: SolanaClient;
  em: EntityManager;
  userRepository: UserRepository;
  usdcMint: Mint;
  tokenAccountRepository: TokenAccountRepository;
  userService: UserService;

  constructor(solanaClient: SolanaClient,
              em: EntityManager,
              userRepository: UserRepository,
              usdcMint: Mint,
              tokenAccountRepository: TokenAccountRepository,
              userService: UserService
              ) {
    this.solanaClient = solanaClient;
    this.userService = userService;
    this.userRepository = userRepository;
    this.usdcMint = usdcMint;
    this.em = em;
    this.tokenAccountRepository = tokenAccountRepository;
  }

// reclaim all sol
  async drainUser(user: User) {
    // check if the user's wallet has sol
    const userWallet = user.keypair();
    let solBalance = await this.solanaClient.getSolBalance(userWallet.publicKey);
    if (solBalance > 0) {
      // get the systemUser to transfer back to
      const systemUser: User = await this.em.transactional(async em => {
        return await this.userRepository.getSystemUser();
      });

      // first drain the usdc token account
      const usdcTokenAccount = await this.em.transactional(async (em) => {
        return await this.tokenAccountRepository.findByTokenSymbol(user.id, "USDC");
      });

      let txid = null;
      if (usdcTokenAccount.balance > 0) {
        txid = await this.solanaClient.sendTokens(userWallet.publicKey, systemUser.publicKey(), usdcTokenAccount.balance, this.usdcMint.address, this.usdcMint.decimals, true, userWallet);
        this.logger.debug(`drained ${usdcTokenAccount.balance} USDC from ${user.email} (${user.id}) to system user. txid: ${txid}`);
      }

      // now drain sol - note: this doesn't seem to work properly on devnet cause not enough funds for some reason
      txid = await this.solanaClient.drainLamports(userWallet.publicKey, systemUser.publicKey(), userWallet);
      this.logger.debug(`drained ${solBalance} SOL from ${user.email} (${user.id}) to system user. txid: ${txid}`);
    }
  }

  async createUser(password: string = "password", fundUser: boolean = true): Promise<User> {
    password = "password" ?? password;
    const registerDto = {
      name: faker.person.firstName() + " " + faker.person.lastName(),
      username: makeId(5),
      email: makeId(5) + "@example.com",
      password
    };
    // create test users - this will also fund the user (in test env)
    const session = await this.userService.register(registerDto, fundUser);
    // confirm the user's email
    const emailConfirmationCode: string = await this.em.transactional(async (em) => {
      const user = await this.userRepository.findById(session.user.id);
      return user.emailConfirmationCode;
    });

    await this.userService.confirmEmail(session.user.id, emailConfirmationCode);
    return await this.em.transactional(async (em) => {
      return await this.userRepository.findById(session.user.id);
    });
  }

}


