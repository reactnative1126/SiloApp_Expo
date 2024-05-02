import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SolanaClient } from "../../solana/solanaclient";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import fs from "fs";
import Bottleneck from "bottleneck";
import { HeliusConnectionWrapper } from "../../solana/connection/HeliusConnectionWrapper";
import { Metaplex } from "@metaplex-foundation/js";
import { SolendAction, SolendMarket, SolendReserve } from "@solendprotocol/solend-sdk/index";
import { Environment } from "../common.types";
import { Paylink } from "../../db/models/Paylink";

// factory pattern for creating commonly used clients and "global" objects
@Injectable()
export class FactoryService implements OnModuleInit {
  private readonly logger = new Logger(FactoryService.name);

  private rpcUrl: string;
  private heliusConnection: HeliusConnectionWrapper;
  private systemSigner: Keypair;
  private keychainDomain: string;
  private solanaThrottler: Bottleneck;
  private metaplex: Metaplex;

  // can we work w/compressed nfts?
  private dasEnabled = false;
  private usdcMint: PublicKey;
  private systemSolanaClient: SolanaClient;
  private jwtPubkey: string;
  private isDevnet: boolean;
  private solendEnv: "devnet" | "production";
  private solendMarket: SolendMarket;
  private solendUsdcReserve: SolendReserve;
  private env: string;
  private baseMainfiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.rpcUrl = this.configService.get("RPC_URL");
    this.isDevnet = this.rpcUrl.indexOf("devnet") > 0;
    if (this.isDevnet) {
      this.solendEnv = "devnet";
    } else {
      this.solendEnv = "production";
    }
    this.heliusConnection = new HeliusConnectionWrapper(this.rpcUrl);

    this.systemSigner =
      Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(this.configService.get("SYSTEM_SIGNER_PRIVATE_KEY")).toString()))
      );

    this.logger.debug(
      `FactoryService initialized with rpcUrl: ${this.rpcUrl}`
    );
    const rpcRateLimit = parseInt(configService.get("RPC_RATE_LIMIT"));
    const minReqTime = Math.floor(1000 / rpcRateLimit);
    this.solanaThrottler = new Bottleneck({
      minTime: minReqTime,
      maxConcurrent: 1
    });

    this.usdcMint = new PublicKey(this.configService.get("USDC_MINT"));
    this.metaplex = new Metaplex(this.heliusConnection);
    this.systemSolanaClient = new SolanaClient(this.anchorProvider(), this.solanaThrottler);
    const env = this.configService.get('ENV');
    this.env = env === 'prod' || env === 'production' ? Environment.PROD : Environment.DEV;
    this.baseMainfiUrl = this.configService.get("BASE_MAINFI_URL");
  }

  async onModuleInit(): Promise<any> {
    try {
      this.solendMarket = await SolendMarket.initialize(
        this.heliusConnection,
        this.solendEnv
      );
      await this.solendMarket.loadReserves();
      for (const reserve of this.solendMarket.reserves) {
        if (reserve.config.liquidityToken?.symbol === "USDC") {
          this.solendUsdcReserve = reserve;
        } else if (reserve.config.liquidityToken.symbol === "SOL") {
          // solReserve = reserve;
        }
      }
    } catch (err) {
      // this is a hack, but it bombs a LOT on devnet
      this.logger.error(`problem initializing solend market: `, err);
      // killin me solend. killin me...
    }

    this.logger.debug(`solend market initialized with env: ${this.solendEnv}`);
    this.logger.log("FactoryService initialized");
  }

  anchorProvider(wallet?: Wallet): AnchorProvider {
    const useWallet = wallet || new Wallet(this.systemSigner);
    return new AnchorProvider(this.heliusConnection, useWallet, {
      commitment: "processed",
      preflightCommitment: "processed"
    });
  }

  getDomain(): string {
    return this.keychainDomain;
  }

  getSystemSigner(): Keypair {
    return this.systemSigner;
  }

  solanaClient(keypair?: Keypair): SolanaClient {
    if (!keypair) {
      return this.systemSolanaClient;
    } else {
      const provider = this.anchorProvider(new Wallet(keypair));
      return new SolanaClient(provider, this.solanaThrottler);
    }
  }

  solanaConnection(): Connection {
    return this.heliusConnection;
  }

  getSolanaThrottler(): Bottleneck {
    return this.solanaThrottler;
  }

  isDasEnabled(): boolean {
    return this.dasEnabled;
  }

  getMetaplex(): Metaplex {
    return this.metaplex;
  }

  getHeliusConnectionWrapper(): HeliusConnectionWrapper {
    return this.heliusConnection as HeliusConnectionWrapper;
  }

  // used as the system "base" currency (configurable for devnet usage)
  getUsdcMint(): PublicKey {
    return this.usdcMint;
  }


  getSolendMarket(): SolendMarket {
    return this.solendMarket;
  }

  getSolendUsdcReserve(): SolendReserve {
    return this.solendUsdcReserve;
  }

  getSolendEnv(): "devnet" | "production" {
    return this.solendEnv;
  }

  isDev() {
    return this.env === Environment.DEV;
  }

  isProd() {
    return this.env === Environment.PROD;
  }

  async populateSolendUsdcReserve(): Promise<SolendReserve> {
    await this.onModuleInit();
    return this.getSolendUsdcReserve();
  }

  createPaylinkUrl(paylink: Paylink): string {
    return this.baseMainfiUrl + "/paylink/" + paylink.claimCode;
  }

  getWalletProfileImage() {
    return "https://rebelfi.nyc3.cdn.digitaloceanspaces.com/assets/paytarget_wallet.png";
  }

  getRebelFiUserProfileImage() {
    return "https://rebelfi.nyc3.cdn.digitaloceanspaces.com/assets/paytarget_rebelfi.png";
  }

  getEmailProfileImage() {
    return "https://rebelfi.nyc3.cdn.digitaloceanspaces.com/assets/paytarget_email.png";
  }

}
