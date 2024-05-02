import { atom } from 'recoil';
import {SystemInfo} from "./system.types";

// stores system info
export const systemInfoAtom = atom<SystemInfo | null>({
    key: 'system',
    default: null
});

