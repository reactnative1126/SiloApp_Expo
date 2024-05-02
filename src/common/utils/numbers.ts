import BN from "bn.js";


export function getTokenMultiplierFromDecimals(decimals: number): BN {
    return new BN(10).pow(new BN(decimals));
}

