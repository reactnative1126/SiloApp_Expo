import { atom } from 'recoil';

// stores the loading status
export const loadingAtom = atom({
    key: 'loading',
    default: false
});

