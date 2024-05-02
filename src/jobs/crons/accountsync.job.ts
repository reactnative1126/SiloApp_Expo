import { Injectable, Logger } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { AbstractJob } from "../abstractJob";
import { SystemService } from "../../api/service/system.service";
import { JOBS } from "../jobs.constants";
import { FactoryService } from "../../common/service/factory.service";
import { AccountSync } from "../../solana/sync/account.sync";
import { BugtrackingService } from "../../common/service/bugtracking.service";

// sync all usdc accounts w/chain (to pick up deposits)
@Injectable()
export class AccountSyncJob extends AbstractJob {
  constructor(
    configService: ConfigService,
    schedulerRegistry: SchedulerRegistry,
    systemService: SystemService,
    bugtrackingService: BugtrackingService,
    readonly factoryService: FactoryService,
    readonly accountSync: AccountSync
  ) {
    super(
      AccountSyncJob.name,
      schedulerRegistry,
      systemService,
      configService,
      bugtrackingService,
      "ENABLE_ACCOUNT_SYNC_JOB",
      JOBS.ACCOUNT_SYNC_JOB
    );
    if (this.enabled) {
      this.logger.log("AccountSyncJob Enabled!");
    } else {
      this.logger.log("AccountSyncJob Disabled");
    }
  }

  @Cron("*/14 * * * * *", {
    name: JOBS.ACCOUNT_SYNC_JOB
  })
  async processTasks() {
    await super.runJob();
  }

  async doJob() {
    const usdcMint = this.factoryService.getUsdcMint();
    await this.accountSync.syncTokenAccounts(usdcMint);
  }
}
