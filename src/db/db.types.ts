export enum ADDRESS_TYPE {
  UNKNOWN = "UNKNOWN",
  PAYLINK = 'PAYLINK',
  EMAIL = 'EMAIL',
  WALLET = 'WALLET'
}

export enum TX_STATUS {
  PENDING = "PENDING",
  SYNCED = "SYNCED",
  SYNCED_ERROR = "SYNCED_ERROR",
  DIRECT = "DIRECT",
}

export enum ACCOUNT_TX_ACTION_TYPE {
  FUNDING = "FUNDING",     // initial system deposit
  PAYMENT = "PAYMENT",     // outgoing
  // TRANSFER = 'TRANSFER',
  RECEIPT = "RECEIPT",     // incoming

  // on/off ramp
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export enum AccountTxType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum ACCOUNT_TX_STATUS {
  CREATED = "CREATED",        // initial creation (e.g. when action is created)
  SUBMITTED = "SUBMITTED",    // submitted to blockchain
  SYNCED = "SYNCED",          // synced w/blockchain
  ERROR = "ERROR",            // error syncing, or submitting (e.g. insufficient funds)
}

export enum USER_ROLE {
  SYSTEM = "SYSTEM",
  USER = "USER",
}

export enum USER_STATUS {
  REGISTERED = 'REGISTERED',
  ACTIVE = "ACTIVE",        // user becomes active on 1st login after email confirmtion (user gets initialized w/wallet etc.)
  INVITED = "INVITED",
  BANNED = "BANNED",
  DELETED = "DELETED"
}

export enum PAYLINK_STATUS {
  CREATED = 'CREATED',
  FUNDED = 'FUNDED',      // funded by creator
  RECLAIMED = 'RECLAIMED', // reclaimed by creator
  CLAIMED = 'CLAIMED',    // claimed by whoever link was sent to (but not disbursed)
  PAYED = 'PAYED' // disbursed to claimant
}

export enum TransferStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  ERROR = 'ERROR',
}

export enum TransferTargetType {
  USER = "USER",
  REBELTAG = 'REBELTAG',
  EMAIL = "EMAIL",
  SOLANA_ADDRESS = "SOLANA_ADDRESS",
  PAYLINK = "PAYLINK",
  CONTACT = "CONTACT"
}

export enum ACTION_TYPE {
  FUNDING = "FUNDING",
  PAYMENT = "PAYMENT",
  PAYLINK_PAYMENT = "PAYLINK_PAYMENT",
  LEND_DEPOSIT = "LEND_DEPOSIT",
  LEND_WITHDRAW = "LEND_WITHDRAW",
}

export enum ACTION_STATUS {
  CREATED = "CREATED",        // waiting to be confirmed
  CONFIRMED = "CONFIRMED",    // waiting to be processed
  PROCESSING = "PROCESSING",  // being processed
  PROCESSED = "PROCESSED",    // processed
  SYNCED = 'SYNCED',
  ERROR = "ERROR",            // error processing
  FRAUD = "FRAUD",
}

export enum ACTION_TARGET_TYPE {
  USER = "USER",
  CONTACT = "CONTACT",
  EMAIL = "EMAIL",
  PAYLINK = "PAYLINK",
  WALLET = "WALLET",
  LENDING = 'LENDING'
}

export enum AddressType {
  EMAIL = "EMAIL",
  WALLET = "WALLET",
  PAYLINK = "PAYLINK",
  USER = "USER"
}

export enum PayTargetType {
  REBELTAG = "REBELTAG",
  USER = 'USER',
  CONTACT = 'CONTACT'
}

export interface PayTargetRequestDto {
  targetType: PayTargetType;
  targetId: string | number;
}

export enum ContactType {
  EMAIL = "EMAIL",
  WALLET = "WALLET",
  USER = "USER"
}
