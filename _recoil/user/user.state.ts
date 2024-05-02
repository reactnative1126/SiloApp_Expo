import { atom } from 'recoil';
import { UserState, Wallet, Contact } from "./user.types";


// stores the jwt token
export const userAtom = atom<UserState | undefined | null>({
    key: 'user',
    default: undefined
});

export const transactionsAtom = atom<Wallet | undefined | null>({
    key: 'transactions',
    default: undefined
});

export const contactAtom = atom<Contact[] | undefined | null>({
    key: 'contacts',
    default: undefined
});


