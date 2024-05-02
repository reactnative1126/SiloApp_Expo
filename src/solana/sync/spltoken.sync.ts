import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ISolanaClient } from "../solanaclient";
import { ConfigService } from "@nestjs/config";
import { FactoryService } from "../../common/service/factory.service";
import { PublicKey } from "@solana/web3.js";
import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import Bottleneck from "bottleneck";
import { Token } from "../../db/models/Token";
import { NATIVE_MINT } from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { TokenRepository } from "../../db/repositories/token.repository";
import Tokenregistry from "../../utils/tokenregistry";

@Injectable()
export class SplTokenSync implements OnModuleInit {
  private readonly logger = new Logger(SplTokenSync.name);

  private solanaClient: ISolanaClient;

  // throttle solana requests
  private throttler: Bottleneck;

  private metaplex: Metaplex;

  constructor(
    private readonly configService: ConfigService,
    // private readonly em: EntityManager,
    private readonly orm: MikroORM,
    private readonly factoryService: FactoryService,
    private readonly splTokenRepository: TokenRepository
  ) {
    this.solanaClient = factoryService.solanaClient();
    this.throttler = factoryService.getSolanaThrottler();
    this.metaplex = factoryService.getMetaplex();
  }

  async onModuleInit() {
    // make sure we've got the native solana token
    await this.checkNativeToken();
    this.logger.debug("SplTokenSync initialized");
  }

  @UseRequestContext()
  async checkNativeToken(): Promise<void> {
    const nativeToken = await this.splTokenRepository.getNativeMint();
    if (!nativeToken) {
      this.logger.debug("native solana token not found in db, putting it in...");
      const nativeToken = new Token(
        NATIVE_MINT.toBase58(),
        9,
        "Solana",
        "SOL",
        "https://solana-cdn.com/cdn-cgi/image/width=40/https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png"
      );
      await this.splTokenRepository.persistAndFlush(nativeToken);
      this.logger.debug("saved native solana token to db");
    }
  }

  // pulls the token data from solana and saves to db (overwrites db instances if they already exist)
  @UseRequestContext()
  async syncTokenMint(mint: PublicKey, name?: string, symbol?: string, imageUrl?: string, useMetadata: boolean = true): Promise<Token> {
    // see if we've got this bitch in the db
    let splToken = await this.splTokenRepository.findOne({ mint: mint.toBase58() });
    if (!splToken) {
      this.logger.debug(`adding spl token mint: ${mint}`);

      // first check token registry (maybe we don't have to hit the chain)
      const tokenInfo = Tokenregistry.getTokenInfo(mint.toBase58());
      if (tokenInfo) {
        this.logger.debug(`found mint ${mint.toBase58()} in token registry as ${tokenInfo.symbol}`);
        splToken = new Token(
          mint.toBase58(),
          tokenInfo.decimals,
          tokenInfo.name,
          tokenInfo.symbol,
          tokenInfo.logoURI
        );
        await this.splTokenRepository.persistAndFlush(splToken);
      } else {
        const mintInfo = await this.solanaClient.getMint(mint);
        if (useMetadata) {
          // then we need to load from chain using metaplex
          const pda = this.metaplex.nfts().pdas().metadata({ mint });
          const mdAcct = await this.metaplex.connection.getAccountInfo(pda);
          if (mdAcct) {
            const token = await this.metaplex.nfts().findByMint({ mintAddress: mint, loadJsonMetadata: true });
            name = token.name;
            symbol = token.symbol;
            imageUrl = token.uri;
          } else {
            // this should never happen. we should probably switch to use an "approved" currency list at some point
            this.logger.warn(`token mint metadata account not found for mint ${mint}, and not found in registry...`);
          }
        }

        splToken = new Token(mint.toBase58(), mintInfo.decimals, name, symbol, imageUrl);
        await this.splTokenRepository.persistAndFlush(splToken);
      }
    }
    return splToken;
  }
}
