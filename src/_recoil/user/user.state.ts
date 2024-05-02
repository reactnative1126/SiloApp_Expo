import { atom } from 'recoil';
import { UserState, Wallet, Contact, Notification } from './user.types';

export const defaultUser = {
    id: 0,
    name: '',
    email: '',
    username: '',
    walletAddress: '',
    profileImage: '',
    phone: '',
    savingsRate: 0,
    earningAmount: 0,
    startDate: 0,
    credits: 0,
    userId: 0,
    message: '',
    accounts: [],
    balances: {
        USDC: {
            balance: 0,
            iconUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        }
    },
    earning: {
        primaryCurrencyCode: 'USD',
        localCurrencyCode: 'COP',
        perYear: {
            USD: 0,
            primary: 0,
            local: 0,
            COP: 0
        },
        toDate: {
            USD: 0,
            primary: 0,
            local: 0,
            COP: 0
        }
    },
    currency: {
        id: 45,
        name: 'United States dollar',
        code: 'USD',
        emoji: '🇺🇸',
        decimals: 2,
        locale: 'en-US',
        usdExchangeRate: 1
    },
};

export const userAtom = atom<UserState>({
    key: 'user',
    default: defaultUser
});

export const transactionsAtom = atom<Wallet | undefined | null>({
    key: 'transactions',
    default: undefined
});

export const contactAtom = atom<Contact[] | undefined | null>({
    key: 'contacts',
    default: undefined
});

export const notificationsAtom = atom<{ [x: string]: Notification[] } | {}>({
    key: 'notificaions',
    default: undefined
});

export const notificationSettingsAtom = atom<{} | {}>({
    key: 'notificaion-settings',
    default: undefined
});