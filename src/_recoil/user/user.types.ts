import { PayTarget, SearchQueryType } from '../transfers/transfers.types'

export interface BalanceMap {
  [key: string]: {
    balance: number,
    iconUrl: string,
  }
}

export interface Token {
  iconUrl: string,
  id: number,
  name: string,
  symbol: string,
}

export interface Account {
  balance: number,
  balanceCurrency: number,
  id: number,
  token: Token,
  transactions: Array<Transaction>
}

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT"
}

export interface Transaction {
  cryptoAmount: number,
  cryptoSymbol: string,
  fiatAmount: number,
  fiatSymbol: string,
  createdAt: string,
  txType: TransactionType,
  counterpartyImage: string,
  counterpartyName: string,
}

export interface Wallet {
  balance: number,
  token: Token,
  transactions: Transaction[]
}

export interface Earning {
  localCurrencyCode: string,
  perYear: any,
  primaryCurrencyCode: string,
  toDate: any
}

export interface Currency {
  code: string,
  emoji: string,
  id: number,
  name: string,
  decimals: number,
  locale: string,
  usdExchangeRate: number
}

export interface UserState {
  credits: number,
  email: string,
  id: number,
  name: string,
  username: string,
  userId: number,
  accounts: Array<Account>,
  balances: BalanceMap,
  savingsRate: number,
  earningAmount: number,
  earning: Earning,
  message: string,    // message to display to the user
  currency: Currency,
  startDate: number,
  profileImage: string,
  walletAddress: string,
  phone: string
}

export interface Contact {
  id: number,
  name: string,
  email: string,
  walletAddress: string,
  rebelfiContact: {
    id: 5,
    name: string,
    username: string,
    email: string,
    walletAddress: string,
    profileImage: string
  }
}

export interface Notification {
  id: number,
  image: string,
  status: string,
  actions: Array<string>,
  actionStatus: string,
  type: string,
  counterparty: string,
  counterpartyId: number,
  message: string,
  createdAt: string,
  isNew: boolean
}

export interface NotifySettings {
  push: boolean,
  email: boolean,
}

export interface GetTransactionResponse {
  account: Wallet
}
export interface GetNotificationsResponse {
  numNew: number,
  notifications: Array<Notification>
}
export interface NotificationSettingsResponse {
  settings: NotifySettings,
}
export interface ContactsResponse {
  contacts: Array<Contact>,
}
export interface SearchContactsResponse {
  payTargets: Array<PayTarget>,
  queryType: SearchQueryType
}
