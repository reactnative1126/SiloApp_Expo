import { Injectable, Logger } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { AbstractJob } from "../abstractJob";
import { SystemService } from "../../api/service/system.service";
import { JOBS } from "../jobs.constants";
import { FactoryService } from "../../common/service/factory.service";
import { ActionProcessorService } from "../../api/service/actionProcessor.service";
import { BugtrackingService } from "../../common/service/bugtracking.service";

// processes any pending actions
@Injectable()
export class ActionProcessorJob extends AbstractJob {
  constructor(
    configService: ConfigService,
    schedulerRegistry: SchedulerRegistry,
    systemService: SystemService,
    bugtrackingService: BugtrackingService,
    readonly factoryService: FactoryService,
    readonly actionService: ActionProcessorService
  ) {
    super(
      ActionProcessorJob.name,
      schedulerRegistry,
      systemService,
      configService,
      bugtrackingService,
      "ENABLE_ACTION_PROCESSOR_JOB",
      JOBS.ACTION_PROCESSOR_JOB
    );
    if (this.enabled) {
      this.logger.log("ActionProcessorJob Enabled!");
    } else {
      this.logger.log("ActionProcessorJob Disabled");
    }
  }

  @Cron("*/4 * * * * *", {
    name: JOBS.ACTION_PROCESSOR_JOB
  })
  async processTasks() {
    await super.runJob();
  }

  async doJob() {
    await this.actionService.processConfirmedActions();
  }
}
