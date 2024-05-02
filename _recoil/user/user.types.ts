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
  id: number,
  token: Token
}

export interface Transaction {
  createdAt: string,
  txType: string,
  amount: number,
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
  name: string
}

export interface UserState {
  credits: number,
  email: string,
  id: number,
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