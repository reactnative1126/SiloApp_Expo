import { Injectable, Logger } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { AbstractJob } from "../abstractJob";
import { SystemService } from "../../api/service/system.service";
import { JOBS } from "../jobs.constants";
import { BugtrackingService } from "../../common/service/bugtracking.service";

// processes any pending actions
@Injectable()
export class InfoUpdaterJob extends AbstractJob {
  constructor(
    configService: ConfigService,
    bugtrackingService: BugtrackingService,
    schedulerRegistry: SchedulerRegistry,
    systemService: SystemService,
  ) {
    super(
      InfoUpdaterJob.name,
      schedulerRegistry,
      systemService,
      configService,
      bugtrackingService,
      null,
      JOBS.INFO_UPDATER_JOB
    );
  }

  // at the 17th second of every 15 minutes
  @Cron("17 */15 * * * *", {
    name: JOBS.INFO_UPDATER_JOB
  })
  async processTasks() {
    await super.runJob();
  }

  async doJob() {
    await this.systemService.refreshSystemInfo();
  }
}
