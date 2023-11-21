import { atom } from 'recoil';

// stores the jwt token
export const authAtom = atom({
    key: 'auth',
    default: {
        token: null,
        authed: false
    }
});

export const phoneAtom = atom({
    key: 'phone',
    default: {
        requestId: 1,
        success: false
    }
});

