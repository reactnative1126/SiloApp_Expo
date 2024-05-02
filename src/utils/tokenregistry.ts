import {ENV, TokenInfo, TokenListProvider} from "@solana/spl-token-registry";

export class TokenRegistry {

  private tokenMap = new Map<string, TokenInfo>();

  constructor() {

    const chainId = ENV.MainnetBeta;

    new TokenListProvider().resolve().then(tokens => {
      const tokenList = tokens.filterByChainId(chainId).getList();
      for (const token of tokenList) {
        if(token.address === "NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s"){ // YAKU is big dumb
          this.tokenMap.set(token.address, {
            ...token,
            decimals: 9
          })
        } else {
          this.tokenMap.set(token.address, token);
        }
      }
    });
  }
  
  getTokenInfo(address: string): TokenInfo | undefined {
    return this.tokenMap.get(address);
  }
}

export default new TokenRegistry();