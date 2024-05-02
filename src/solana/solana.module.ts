import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "../common/common.module";
import { AnalyticsModule } from "../analytics/analytics.module";

// services
import { SolanaService } from "./solana.service";
import { SplTokenSync } from "./sync/spltoken.sync";
import { AccountSync } from "./sync/account.sync";
import { SolanaDbService } from "./service/solanadb.service";

@Module({
  imports: [DbModule, ConfigModule, CommonModule, AnalyticsModule],
  providers: [
    SplTokenSync,
    AccountSync,
    SolanaService,
    SolanaDbService
  ],
  exports: [SolanaService, AccountSync, SplTokenSync, SolanaDbService]
})
export class SolanaModule {
}
