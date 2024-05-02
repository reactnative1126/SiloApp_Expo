import { Injectable, Logger } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { AbstractJob } from "../abstractJob";
import { SystemService } from "../../api/service/system.service";
import { JOBS } from "../jobs.constants";
import { FactoryService } from "../../common/service/factory.service";
import { ActionProcessorService } from "../../api/service/actionProcessor.service";
import { BugtrackingService } from "../../common/service/bugtracking.service";
import { TransferProcessorService } from "../../api/service/transferprocessor.service";

// processes any pending actions
@Injectable()
export class TransferProcessorJob extends AbstractJob {
  constructor(
    configService: ConfigService,
    schedulerRegistry: SchedulerRegistry,
    systemService: SystemService,
    bugtrackingService: BugtrackingService,
    readonly factoryService: FactoryService,
    readonly transferProcessorService: TransferProcessorService
  ) {
    super(
      TransferProcessorJob.name,
      schedulerRegistry,
      systemService,
      configService,
      bugtrackingService,
      "ENABLE_TRANSFER_PROCESSOR_JOB",
      JOBS.TRANSFER_PROCESSOR_JOB
    );
    if (this.enabled) {
      this.logger.log("TransferProcessorJob Enabled!");
    } else {
      this.logger.log("TransferProcessorJob Disabled");
    }
  }

  @Cron("*/3 * * * * *", {
    name: JOBS.TRANSFER_PROCESSOR_JOB
  })
  async processTasks() {
    await super.runJob();
  }

  async doJob() {
    await this.transferProcessorService.processTransfers();
  }
}
