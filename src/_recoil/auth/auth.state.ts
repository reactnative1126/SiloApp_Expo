import { atom } from 'recoil';
import { AuthState } from './auth.types';

// stores the jwt token
export const authAtom = atom<AuthState>({
    key: 'auth',
    default: {
        token: null,
        authed: false,
        phoneVerfication: {
            isVerified: false,
            requestId: '',
            code: ''
        }
    }
});

