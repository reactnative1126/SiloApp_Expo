import { Token } from "../../db/models/Token";
import { TokenAccount } from "../../db/models/TokenAccount";
import { AccountTx } from "../../db/models/AccountTx";
import { User } from "../../db/models/User";
import { Contact } from "../../db/models/Contact";
import { Currency } from "../../db/models/Currency";
import { Paylink } from "src/db/models/Paylink";
import { formatAddress, formatCurrency, formatUsd } from "../../common/utils/strings";
import { PayTargetType } from "../../db/db.types";

const DUMMY_PROFILE_IMAGE = "https://rebelfi.nyc3.cdn.digitaloceanspaces.com/assets/fake_profile.jpg";

export class TokenDto {
  name: string;
  symbol: string;
  iconUrl: string;

  constructor(token: Token) {
    this.name = token.name;
    this.symbol = token.symbol;
    this.iconUrl = token.iconUrl;
  }

  isUsdc() {
    return this.symbol === "USDC";
  }
}

export class AccountTransactionDto {

  createdAt: Date;
  txType: string;
  cryptoAmount: number;
  cryptoSymbol: string;
  fiatAmount: number;
  fiatSymbol: string;
  counterpartyName: string;
  counterpartyImage: string;

  constructor(acctTx: AccountTx) {
    this.createdAt = acctTx.createdAt;
    this.txType = acctTx.txType;
    // this.cryptoAmount = acctTx.amount;
    this.cryptoAmount = Math.abs(acctTx.amount);
    this.cryptoSymbol = "USD";    // hardcode for now
    // this.cryptoSymbol = "";    // don't use one for now (just use the $ sign)
    this.fiatAmount = Math.abs(acctTx.currencyAmount.amount);
    // this.fiatAmount = acctTx.currencyAmount.amount;
    this.fiatSymbol = acctTx.currencyAmount.currency.code;
    this.counterpartyName = acctTx.counterpartyName;
    // todo: user's
    this.counterpartyImage = "https://rebelfi.nyc3.cdn.digitaloceanspaces.com/assets/avatar_logo.svg";
  }
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface PhoneVerificationRequestDto {
  phone: string;
}

export interface PhoneVerificationDto {
  requestId: number;
  code: string;
}

export interface PinDto {
  pin: string;
}

export class CurrencyDto {
  id: number;
  name: string;
  code: string;
  emoji: string;
  decimals: number;
  locale: string;
  usdExchangeRate: number;

  constructor(currency: Currency) {
    this.id = currency.id;
    this.name = currency.name;
    this.code = currency.code;
    this.emoji = currency.emoji;
    this.decimals = currency.decimals;
    this.locale = currency.locale;
    this.usdExchangeRate = currency.usdExchangeRate;
  }
}

export interface SessionDto {
  user: UserDto;
  authToken: string;
}


export class TokenAccountDto {
  id: number;
  balance: number;
  balanceCurrency: number;
  token: TokenDto;
  transactions: AccountTransactionDto[];

  constructor(tokenAccount: TokenAccount, includeTransactions: boolean = false) {
    this.id = tokenAccount.id;
    this.balance = tokenAccount.balance;
    if (tokenAccount.token.symbol === "USDC") {
      this.balanceCurrency = tokenAccount.user.currency.usdExchangeRate * tokenAccount.balance;
    } else {
      // just set to -1 to indicate that this is not a USDC account
      this.balanceCurrency = -1;
    }
    this.token = new TokenDto(tokenAccount.token);
    if (includeTransactions) {
      this.transactions = tokenAccount.transactions.getItems().map((tx) => new AccountTransactionDto(tx));
    } else {
      this.transactions = null;
    }
  }
}

export class LiteUserDto {
  id: number;
  name: string;
  username: string;
  email: string;
  walletAddress: string;
  profileImage: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.username = user.username;
    this.email = user.email;
    this.walletAddress = user.walletAddress;
    // todo: fix this fake profile img
    this.profileImage = user.profileImage ?? DUMMY_PROFILE_IMAGE;
  }
}

export interface EarningDto {

  primaryCurrencyCode: string;
  localCurrencyCode: string;
  perYear: any;
  toDate: any;
}

export class UserDto extends LiteUserDto {
  accounts: TokenAccountDto[];
  balances: object;
  savingsRate: number;
  earningAmount: number;
  currency: CurrencyDto;
  message: string;        // a message to display to the user
  startDate: number;
  earning: EarningDto;
  phone: string;

  constructor(user: User, savingsRate: number) {
    super(user);
    // todo: address later
    const startDate = user.activatedAt ?? user.registeredAt;
    this.startDate = (startDate ?? new Date()).getTime();
    this.currency = new CurrencyDto(user.currency);
    this.id = user.id;
    this.savingsRate = savingsRate;
    this.email = user.email;
    this.walletAddress = user.walletAddress;
    this.accounts = user.accounts.getItems().map((account) => new TokenAccountDto(account, false));
    this.balances = {};
    // todo: take out this hard-coded phone
    this.phone = user.phone ?? "+12024449988";
    let balanceUsdc = 0;
    let balanceCurrency = 0;
    const savingsRateDecimal = savingsRate / 100;
    user.accounts.getItems().forEach((account) => {
      this.balances[account.token.symbol] = {
        balance: account.balance,
        iconUrl: account.token.iconUrl
      };
      if (account.token.symbol === "USDC") {
        balanceUsdc = account.balance;
        balanceCurrency = account.balance * user.currency.usdExchangeRate;
        this.balances[account.token.symbol]["balanceCurrency"] = balanceCurrency;
        this.earningAmount = Number((account.balance * savingsRateDecimal).toFixed(4));
      }
    });

    const localCurrency = user.currency;

    const earningUsdc = balanceUsdc * savingsRateDecimal;
    const earningCurrency = balanceCurrency * savingsRateDecimal;
    // @ts-ignore
    const earning: EarningDto = {
      primaryCurrencyCode: "USD",
      localCurrencyCode: user.currency.code
    };
    earning["perYear"] = {
      USD: earningUsdc,
      primary: earningUsdc,
      local: earningCurrency
    };
    earning["perYear"][user.currency.code] = earningCurrency;
    // todo: these will need to be calculated later
    earning["toDate"] = {
      USD: 0,
      primary: 0,
      local: 0
    };
    earning["toDate"][user.currency.code] = 0;
    this.earning = earning;
  }
}

export class PaylinkDto {

  amount: number;
  createdBy: LiteUserDto;
  token: TokenDto;

  constructor(paylink: Paylink) {
    this.amount = paylink.amount;
    this.createdBy = new LiteUserDto(paylink.createdBy);
    this.token = new TokenDto(paylink.token);
  }
}

export class ContactDto {
  id: number;
  name: string;
  email: string;
  walletAddress: string;
  rebelfiContact: LiteUserDto;

  constructor(contact: Contact) {
    this.id = contact.id;
    this.name = contact.name;
    this.email = contact.email;
    this.walletAddress = contact.solanaAddress?.address;
    this.rebelfiContact = contact.rebelfiContact ? new LiteUserDto(contact.rebelfiContact) : null;
  }
}

export interface CreateContactDto {
  name: string;
  email: string;
  walletAddress: string;
  rebelfiId: number;
}

export interface SearchUsersDto {
  query: string;
}

export class SearchResultUserDto extends LiteUserDto {
  isContact: boolean;

  constructor(user: User, isContact: boolean) {
    super(user);
    this.isContact = isContact;
  }
}

export class PayTargetDto {
  targetType: string;    // "CONTACT" | "USER"
  targetId: number;     // userId or contactId, depending on the targetType
  isContact: boolean;    // true if this is a contact
  profileImage: string;
  name?: string;           // optional: if rebeluser or contact, then the name, otherwise can be undefined
  addressValue: string;   // for display: can be a @rebeltag, email, or wallet address

  static fromUser(user: User, idType: IdType, isContact: boolean): PayTargetDto {
    const payTarget = new PayTargetDto();
    payTarget.targetType = "USER";
    payTarget.targetId = user.id;
    payTarget.isContact = isContact;
    payTarget.profileImage = user.profileImage ?? DUMMY_PROFILE_IMAGE;
    payTarget.name = user.name;
    switch (idType) {
      case IdType.REBELTAG:
        payTarget.addressValue = "@" + user.username;
        break;
      case IdType.EMAIL:
        payTarget.addressValue = user.email;
        break;
      case IdType.SOLANA_ADDRESS:
        payTarget.addressValue = formatAddress(user.walletAddress);
        break;
      case IdType.NAME:
        payTarget.addressValue = user.name;
        break;
      default:
        // shouldn't happen
        throw new Error(`Unknown id type: ${idType}`);
    }
    // payTarget.addressValue = '@' + user.username;
    return payTarget;
  }

  static fromContact(contact: Contact, idType: IdType, profileImage?: string): PayTargetDto {
    const payTarget = new PayTargetDto();
    payTarget.targetType = "CONTACT";
    payTarget.targetId = contact.id;
    payTarget.isContact = true;
    payTarget.profileImage = contact.rebelfiContact ? contact.rebelfiContact.profileImage : profileImage;
    payTarget.name = contact.name;
    switch (idType) {
      case IdType.REBELTAG:
        payTarget.addressValue = "@" + contact.rebelfiContact.username;
        break;
      case IdType.EMAIL:
        payTarget.addressValue = contact.email;
        break;
      case IdType.SOLANA_ADDRESS:
        payTarget.addressValue = formatAddress(contact.solanaAddress.address);
        break;
      case IdType.NAME:
        payTarget.addressValue = contact.name;
        break;
      default:
        // shouldn't happen
        throw new Error(`Unknown id type: ${idType}`);
    }
    /*
    if (contact.isRebelfiContact()) {
      payTarget.addressValue = '@' + contact.rebelfiContact.username;
    } else if (contact.isEmailContact()) {
      payTarget.addressValue = contact.email;
    } else if (contact.isWalletContact()) {
      payTarget.addressValue = formatAddress(contact.solanaAddress.address);
    }
     */
    return payTarget;
  }
}

export interface FeedbackDto {
  rating: number;
  comment: string;
}

export interface PaymentDto {
  amount: number;  // usdc
  currency?: string;    // undefined == usdc
  targetId: number | string;
  targetType: PayTargetType;
}

export enum IdType {
  EMAIL = "EMAIL",
  SOLANA_ADDRESS = "SOLANA_ADDRESS",
  NAME = "NAME",
  REBELTAG = "REBELTAG"
}

export interface UserSearchResponse {
  payTargets: PayTargetDto[];
  queryType: IdType;
}

export class NotificationSettingsDto {
  email: boolean;
  push: boolean;

  constructor(user: User) {
    this.email = user.emailNotifications;
    this.push = user.pushNotifications;
  }
}

export class UpdateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  currencyCode: string;
}

export interface ExchangeRateDto {
  // rate = amount of currency = 1 usd
  exchangeRate: number;
  currencyCode: string;
}
