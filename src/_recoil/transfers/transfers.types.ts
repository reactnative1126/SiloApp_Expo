import { UserState } from '../user/user.types';

export enum SearchQueryType {
  EMAIL = 'EMAIL',
  SOLANA_ADDRESS = 'SOLANA_ADDRESS',
  REBELTAG = 'REBELTAG',
  NAME = 'NAME'
}

export enum PayTargetType {
  USER = 'USER',
  REBELTAG = 'REBELTAG',
  CONTACT = 'CONTACT'
}

export interface PayTarget {
  targetId: number,
  targetType: PayTargetType,
  profileImage: string,
  name: string,
  addressValue: string,
  isContact: boolean
}

export interface GetPayTargetResponse {
  payTarget: {
    targetId: number,
    targetType: PayTargetType,
    profileImage: string,
    name: string,
    addressValue: string,
    isContact: boolean
  }
}

export interface SendPaymentResponse {
  transfer: any,
  user: UserState
}