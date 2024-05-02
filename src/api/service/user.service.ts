import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";

import { AbstractService } from "./abstract.service";
import { FactoryService } from "../../common/service/factory.service";
import { UserRepository } from "../../db/repositories/user.repository";
import { PublicKey } from "@solana/web3.js";
import { User } from "../../db/models/User";
import {
  ACCOUNT_TX_ACTION_TYPE,
  ACTION_STATUS,
  ACTION_TARGET_TYPE,
  ACTION_TYPE,
  USER_ROLE,
  USER_STATUS
} from "../../db/db.types";
import { ConfigService } from "@nestjs/config";
import { SplTokenSync } from "../../solana/sync/spltoken.sync";
import { SystemService } from "./system.service";
import { FriendlyException } from "../controller/exception/friendly.exception";
import { Contact } from "../../db/models/Contact";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
  ContactDto,
  CreateContactDto,
  IdType,
  LiteUserDto,
  NotificationSettingsDto,
  PayTargetDto,
  RegisterUserDto,
  SessionDto,
  UpdateUserDto,
  UserDto,
  UserSearchResponse
} from "../dto/dto.types";
import * as bcrypt from "bcrypt";
import { Currency } from "../../db/models/Currency";
import { isSolanaAddress, validateEmail } from "../../utils/misc";
import { ValidationException } from "../controller/exception/validation.exception";
import { Action } from "../../db/models/Action";
import { TokenRepository } from "../../db/repositories/token.repository";
import { ContactRepository } from "../../db/repositories/contact.repository";
import { SolanaAddressRepository } from "../../db/repositories/solanaaddress.repository";
import { SolanaAddress } from "../../db/models/SolanaAddress";

@Injectable()
export class UserService extends AbstractService {

  private usdcMint: PublicKey;
  private initialSolFundAmountDecimal: number;
  private initialUsdcFundAmountDecimal: number;

  @InjectRepository(Currency)
  private currencyRepository: EntityRepository<Currency>;

  constructor(
    em: EntityManager,
    orm: MikroORM,
    factoryService: FactoryService,
    userRepository: UserRepository,
    systemService: SystemService,
    readonly configService: ConfigService,
    readonly tokenSync: SplTokenSync,
    readonly tokenRepository: TokenRepository,
    readonly solanaAddressRepository: SolanaAddressRepository,
    readonly contactRepository: ContactRepository
  ) {
    super(UserService.name, em, orm, factoryService, userRepository, systemService);
    this.usdcMint = this.factoryService.getUsdcMint();
    this.initialSolFundAmountDecimal = parseFloat(configService.get("SOL_FUND_AMOUNT"));
    this.initialUsdcFundAmountDecimal = parseFloat(configService.get("USDC_FUND_AMOUNT"));
  }

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    // make sure the system user exists
    const systemUser = await this.userRepository.getSystemUser(false);
    if (!systemUser) {
      await this.initSystemUser();
    }
    this.logger.log("user service initialized...");
  }

  async initSystemUser(): Promise<User> {
    this.logger.debug("Creating system user...");
    const usdCurrency = await this.currencyRepository.findOneOrFail({ code: "USD" });
    const systemUser = new User(this.configService.get("MAIL_SYSTEM_ADDRESS"), "rebelfi", "RebelFi", "", usdCurrency);
    systemUser.password = "---";
    systemUser.emailConfirmed = true;
    systemUser.walletInitialized = true;
    systemUser.walletAddress = this.factoryService.getSystemSigner().publicKey.toBase58();
    systemUser.status = USER_STATUS.ACTIVE;
    systemUser.emailConfirmed = true;

    // const usdcToken = await this.tokenRepository.findByMint(this.usdcMint);
    const usdcToken = await this.tokenSync.syncTokenMint(this.usdcMint, "USD Coin", "USDC", "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png");
    const systemUsdcTokenAccountInfo = await this.factoryService.solanaClient().getTokenAccountInfo(this.usdcMint);
    systemUser.setBalance(usdcToken, systemUsdcTokenAccountInfo.balance);
    systemUser.role = USER_ROLE.SYSTEM;
    await this.em.persistAndFlush(systemUser);
    return systemUser;
  }

  @UseRequestContext()
  // fundUser is for testing
  async register(registerUserDto: RegisterUserDto, fundUser: boolean = true): Promise<SessionDto> {
    const username = registerUserDto.username.toLowerCase().trim();
    const email = registerUserDto.email.toLowerCase().trim();
    const firstName = registerUserDto.firstName.trim();
    const lastName = registerUserDto.lastName.trim();
    const errorMessages = {};
    let existingUser = await this.userRepository.findOne({ username });
    if (existingUser) {
      errorMessages["username"] = "That username is taken.";
    }
    const validEmail = validateEmail(email);
    if (!validEmail) {
      errorMessages["email"] = "That email address is not valid.";
    } else {
      existingUser = await this.userRepository.findOne({ email });
      if (existingUser) {
        errorMessages["email"] = "That email is taken.";
      }
    }
    if (registerUserDto.password.trim().length < 8) {
      errorMessages["password"] = "Password must be at least 8 characters.";
    }
    if (Object.keys(errorMessages).length > 0) {
      throw new ValidationException(errorMessages);
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerUserDto.password.trim(), salt);

    // Create and save the new user
    let fiatCurrency = await this.currencyRepository.findOneOrFail({ code: "USD" });
    const usdcToken = await this.tokenRepository.findBySymbol("USDC");

    // if dev, then auto-activate + set fiat to something other than usd
    if (this.factoryService.isDev()) {
      fiatCurrency = await this.currencyRepository.findOneOrFail({code: "COP"});
    }

    const user = new User(email, username, firstName, lastName, fiatCurrency);
    user.getTokenAccount(usdcToken, true);
    user.password = hashedPassword;
    user.genAuthToken();

    await this.em.persistAndFlush(user);

    // if dev, then auto-fund user + confirm
    if (this.factoryService.isDev() && fundUser) {
      user.confirmedEmail();
      user.activate();
      await this.fundUser(user.id, "welcome");
    }


    return {
      user: await this.getUserDto(user.id),
      authToken: user.authToken
    };
  }

  // last registration step: confirm the email address + fund user
  @UseRequestContext()
  async confirmEmail(userId: number, confirmationCode: string) {
    const user = await this.userRepository.findByEmailConfirmation(userId, confirmationCode);
    if (user && !user.emailConfirmed) {
      user.confirmedEmail();
      // don't fund the user upon email confirm (do on kyc)
      // await this.fundUser(user, "welcome");
      // final step: create the accounts
      await this.userRepository.persistAndFlush(user);
    }
    return !!user;
  }

  @UseRequestContext()
  async confirmPin(userId: number, pin: string) {
    const user = await this.userRepository.findByPinForUser(userId, pin);
    return !!user;
  }

  @UseRequestContext()
  async changePin(userId: number, pin: string) {
    const user = await this.userRepository.getById(userId);
    user.setPin(pin);
    await this.userRepository.persistAndFlush(user);
  }

  // creates an action to fund the user's wallet
  @UseRequestContext()
  async fundUser(userId: number, fundingType: string): Promise<Action> {
    const user = await this.userRepository.getById(userId);

    const systemUser = await this.userRepository.getSystemUser();
    const action = new Action(systemUser, user.id.toString(), ACTION_TARGET_TYPE.USER, ACTION_TYPE.FUNDING);

    action.targetUser = user;
    action.amount = this.initialUsdcFundAmountDecimal;
    action.params = {
      amountDecimal: this.initialUsdcFundAmountDecimal,
      mint: this.usdcMint.toBase58(),
      initWallet: true,
      fundingType
    };

    action.status = ACTION_STATUS.CONFIRMED;
    await this.em.persistAndFlush(action);

    // validation
    // if (!("amountDecimal" in params)) {
    //   throw new Error("missing amountDecimal in params");
    // }
    // if (!("mint" in params)) {
    //   throw new Error("missing mint in params");
    // }

    // action.amount = <number>params["amountDecimal"];
    // action.targetUser = target;

    // now we update the balances to reflect pending amounts
    const token = await this.tokenRepository.findByMint(this.usdcMint);

    const debitAccountTx = systemUser.addPendingDebit(token, this.initialUsdcFundAmountDecimal, ACCOUNT_TX_ACTION_TYPE.FUNDING, user.getName(), user.currency);
    const creditAccountTx = user.addPendingCredit(token, this.initialUsdcFundAmountDecimal, ACCOUNT_TX_ACTION_TYPE.FUNDING, systemUser.getName(), user.currency, true);

    debitAccountTx.withCounterparty(user);
    creditAccountTx.withCounterparty(systemUser);

    debitAccountTx.action = action;
    creditAccountTx.action = action;

    this.em.persist(systemUser);
    this.em.persist(user);
    await this.em.persistAndFlush(action);
    return action;
  }


  @UseRequestContext()
  async getUserByAuthToken(authToken: string) {
    return await this.userRepository.findByAuthToken(authToken);
  }

  @UseRequestContext()
  async logout(userId: number): Promise<any> {
    const user = await this.userRepository.getByIdLite(userId);
    user.logout();
    await this.userRepository.persistAndFlush(user);
    return true;
  }

  @UseRequestContext()
  async login(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      throw new FriendlyException("Invalid login.");
    }

    const isPasswordValid = await bcrypt.compare(password.trim(), user.password);
    if (!isPasswordValid) {
      throw new FriendlyException("Invalid login.");
    }

    user.genAuthToken();
    await this.userRepository.persistAndFlush(user);
    return {
      user: await this.getUserDto(user.id),
      authToken: user.authToken
    };
  }

  @UseRequestContext()
  async activateUser(userId: number) {
    const user = await this.userRepository.getById(userId);
    user.activate();
    await this.userRepository.persistAndFlush(user);
  }

  async createInvitedUser(inviter: User, email: string, name: string = null): Promise<User> {
    return await this.em.transactional(async em => {
      let user = await this.userRepository.findByEmail(email);
      const usdCurrency = await em.findOneOrFail(Currency, { code: "USD" });
      if (!user) {
        user = new User(email, email, email, email, usdCurrency);
        user.inviteBy(inviter);
        await this.em.persistAndFlush(user);
      }
      return user;
    });
  }

  @UseRequestContext()
  async removeContact(userId: number, contactId: number): Promise<ContactDto[]> {
    const contact = await this.contactRepository.findOne({ user: { id: userId }, id: contactId });
    if (!contact) {
      throw new FriendlyException(`Unknown contact.`);
    }
    this.contactRepository.remove(contact);
    await this.contactRepository.flush();
    return await this.getContacts(userId);
  }

  @UseRequestContext()
  async updateContact(userId: number, contactId: number, contactInfo: CreateContactDto): Promise<ContactDto[]> {
    const user = await this.userRepository.getById(userId);
    const contact = await this.contactRepository.findOne({ id: contactId });
    if (!contact) {
      throw new FriendlyException(`Unknown contact.`);
    }
    contact.update(contactInfo);
    await this.contactRepository.persistAndFlush(contact);
    return await this.getContacts(userId);
  }

  // add a contact to user's contact list.
  // note: currently this method only supports 1 of rebelfiContactId, email, or walletAddress, in that order
  @UseRequestContext()
  async addContact(userId: number, contactInfo: CreateContactDto): Promise<ContactDto[]> {
    if (!contactInfo.rebelfiId && !contactInfo.email && !contactInfo.walletAddress) {
      throw new FriendlyException(`Invalid contact info.`);
    }
    const user = await this.userRepository.getById(userId);
    let newContact = null;
    let existingUser = null;
    if (contactInfo.rebelfiId) {
      existingUser = await this.userRepository.findById(contactInfo.rebelfiId);
    }
    if (!existingUser && contactInfo.email) {
      const emailNormalized = contactInfo.email.toLowerCase().trim();
      existingUser = await this.userRepository.findByEmail(emailNormalized);
      if (!existingUser) {
        // todo: stop - don't create a user
        existingUser = await this.createInvitedUser(user, emailNormalized, contactInfo.name);
      }
    }
    if (!existingUser && contactInfo.walletAddress) {
      existingUser = await this.userRepository.findByWallet(contactInfo.walletAddress.trim());
      if (!existingUser) {
        // then we just save the wallet address
        let solanaAddress: SolanaAddress = await this.solanaAddressRepository.findByAddress(contactInfo.walletAddress.trim());
        if (!solanaAddress) {
          try {
            solanaAddress = new SolanaAddress(contactInfo.walletAddress.trim());
          } catch (err) {
            throw new FriendlyException(`Invalid wallet address.`);
          }
          await this.solanaAddressRepository.persistAndFlush(solanaAddress);
          newContact = new Contact(user, solanaAddress);
        } else {
          // check if this wallet is already a contact
          const existingWalletContact = await this.contactRepository.findOne({
            user: { id: user.id },
            solanaAddress: { id: solanaAddress.id }
          });
          if (!existingWalletContact) {
            newContact = new Contact(user, solanaAddress);
          }
        }
      }
    }

    // at this point we'll either have an existingUser (email or rebelfi user) OR a newContact (wallet address), but might be null if already exists
    if (newContact) {
      user.addContact(newContact);
      // then we don't have a rebelfi user so save the name from the dto
      newContact.name = contactInfo.name;
      await this.contactRepository.persistAndFlush(newContact);
    } else if (existingUser) {
      // make sure the contact doesn't already exist
      const existingContact = await this.contactRepository.findOne({
        user: { id: user.id },
        rebelfiContact: { id: existingUser.id }
      });
      if (!existingContact) {
        newContact = user.addRebelfiContact(existingUser);
        newContact.name = existingUser.name;
        await this.contactRepository.persistAndFlush(newContact);
      }
    } else {
      throw new FriendlyException("Unknown user.");
    }
    return await this.getContacts(userId);
  }

  @UseRequestContext()
  async getContacts(userId: number): Promise<ContactDto[]> {
    const user = await this.userRepository.getById(userId);
    const contacts = await this.contactRepository.find({ user: { id: user.id } }, { populate: ["rebelfiContact", "solanaAddress"] });
    return contacts.map((contact) => new ContactDto(contact));
  }

  // search will need to search by email, rebeltag, and name, solana address
  @UseRequestContext()
  async searchUsers(userId, query: string): Promise<UserSearchResponse> {
    const user = await this.userRepository.getById(userId);
    // first, determine if the query is by email, rebeltag, name, or solana address
    // if it's a rebeltag, starts with '@'
    const userResults = [];
    const contactResults: Contact[] = [];
    let queryType: IdType | null;
    query = query.trim();
    const queryNormalized = query.toLowerCase().trim();
    if (queryNormalized.startsWith("@")) {
      const rebeltag = queryNormalized.substr(1);
      queryType = IdType.REBELTAG;
      const foundUsers = await this.userRepository.searchByUsername(rebeltag);
      if (foundUsers.length > 0) {
        userResults.push(...foundUsers);
      }
    } else if (validateEmail(queryNormalized)) {
      queryType = IdType.EMAIL;
      // then it's an email
      const foundUser = await this.userRepository.findByEmail(queryNormalized);
      if (foundUser) {
        userResults.push(foundUser);
      } else {
        // try contacts
        const foundContact = await this.contactRepository.findByEmailForUser(user.id, queryNormalized);
        if (foundContact) {
          contactResults.push(foundContact);
        }
      }
    } else if (isSolanaAddress(query)) {
      queryType = IdType.SOLANA_ADDRESS;
      // then it's a solana address
      const foundUser = await this.userRepository.findByWallet(query);
      if (foundUser) {
        userResults.push(foundUser);
      } else {
        // try contacts
        const foundContact = await this.contactRepository.findByWalletForUser(user.id, query);
        if (foundContact) {
          contactResults.push(foundContact);
        }
      }
    } else {
      queryType = IdType.NAME;
      // then do a name search
      const foundUsers = await this.userRepository.searchByName(queryNormalized);
      if (foundUsers.length > 0) {
        userResults.push(...foundUsers);
      }
      // look in contacts
      const foundContacts = await this.contactRepository.findByNameForUser(user.id, queryNormalized);
      if (foundContacts.length > 0) {
        contactResults.push(...foundContacts);
      }
    }

    const resultsUserIds = userResults.map((user) => user.id);
    // find which are contacts
    const contacts = await this.contactRepository.find({
      user: { id: user.id },
      rebelfiContact: { id: { $in: resultsUserIds } }
    });
    const contactUserIds = contacts.map((contact) => contact.rebelfiContact.id);

    //  filter out system + self
    let searchResults: PayTargetDto[] = userResults.filter(resultUser => resultUser.id !== user.id && !resultUser.isSystem())
     .map((user) => PayTargetDto.fromUser(user, queryType, contactUserIds.includes(user.id)));

    for (let i = 0; i < contactResults.length; i++) {
      const contact = contactResults[i];
      let profileImage = null;
      if (!contact.isRebelfiContact()) {
        if (contact.isEmailContact()) {
          profileImage = this.factoryService.getEmailProfileImage();
        } else if (contact.isWalletContact()) {
          profileImage = this.factoryService.getWalletProfileImage();
        }
      }
      searchResults.push(PayTargetDto.fromContact(contact, queryType, profileImage));
    }

    // sort - contacts first, then by name
    searchResults.sort((a, b) => {
      if (a.isContact && !b.isContact) {
        return -1;
      } else if (!a.isContact && b.isContact) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    // truncate to first 10 results
    searchResults = searchResults.slice(0, 10);
    return {
      payTargets: searchResults,
      queryType
    }
  }

  @UseRequestContext()
  async setNotificationSettings(userId: number, notificationOptionsDto: NotificationSettingsDto): Promise<NotificationSettingsDto> {
    const user = await this.userRepository.getByIdLite(userId);
    user.setNotifications(notificationOptionsDto.email, notificationOptionsDto.push);
    await this.userRepository.persistAndFlush(user);
    return new NotificationSettingsDto(user);
  }

  @UseRequestContext()
  async getNotificationSettings(userId: number): Promise<NotificationSettingsDto> {
    const user = await this.userRepository.getByIdLite(userId);
    return new NotificationSettingsDto(user);
  }

  @UseRequestContext()
  async getUserInfo(rebeltag: string): Promise<LiteUserDto> {
    const user = await this.userRepository.findOne({ username: rebeltag.trim().toLowerCase() });
    if (!user) {
      throw new FriendlyException("Unknown user.");
    }
    return new LiteUserDto(user);
  }

  @UseRequestContext()
  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.getById(userId);
    // right now just update the currency
    if (user.currency.code !== updateUserDto.currencyCode) {
      user.currency = await this.currencyRepository.findOneOrFail({ code: updateUserDto.currencyCode });
      await this.userRepository.persistAndFlush(user);
    }
    return await this.getUserDto(userId);
  }

}
