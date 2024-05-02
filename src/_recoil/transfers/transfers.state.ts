import { atom } from 'recoil';
import { PayTarget } from './transfers.types';

export const payTargetAtom = atom<PayTarget | undefined | null>({
    key: 'pay-target',
    default: undefined
});