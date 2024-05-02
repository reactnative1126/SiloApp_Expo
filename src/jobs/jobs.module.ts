import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "../common/common.module";
import { SolanaModule } from "../solana/solana.module";
import { DbModule } from "../db/db.module";
import { AnalyticsModule } from "../analytics/analytics.module";
import { ApiModule } from "../api/api.module";
import { EmailModule } from "../email/email.module";
import { ActionProcessorJob } from "./crons/actionprocessor.job";
import { AccountSyncJob } from "./crons/accountsync.job";
import { MailerJob } from "./crons/mailer.job";
import { InfoUpdaterJob } from "./crons/infoupdater.job";
import { TransferProcessorJob } from "./crons/transferprocessor.job";

@Module({
  imports: [ConfigModule, CommonModule, DbModule, AnalyticsModule, SolanaModule, ApiModule, EmailModule],
  providers: [MailerJob, ActionProcessorJob, AccountSyncJob, InfoUpdaterJob, TransferProcessorJob],
  exports: [MailerJob]
})
export class JobsModule {
}
