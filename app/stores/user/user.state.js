import { atom } from 'recoil';

// stores the user
export const userAtom = atom({
    key: 'user',
    default: undefined
});

export const transactionsAtom = atom({
    key: 'transactions',
    default: undefined
});

