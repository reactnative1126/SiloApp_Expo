import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import { JOBS } from "./jobs.constants";
import { SchedulerRegistry } from "@nestjs/schedule";
import { SystemService } from "../api/service/system.service";
import Bugsnag from "@bugsnag/js";
import { BugtrackingService } from "../common/service/bugtracking.service";

export class AbstractJob {

  protected readonly logger: Logger;
  protected enabled: boolean;
  protected configService: ConfigService;
  protected jobName: string;
  protected schedulerRegistry: SchedulerRegistry;
  protected systemService: SystemService;
  protected bugtrackingService: BugtrackingService;

  constructor(loggerName: string,
              schedulerRegistry: SchedulerRegistry,
              systemService: SystemService,
              configService: ConfigService,
              bugtrackingService: BugtrackingService,
              enabledProp: string,
              jobName: string) {
    this.bugtrackingService = bugtrackingService;
    this.logger = new Logger(loggerName);
    this.systemService = systemService;
    this.schedulerRegistry = schedulerRegistry;
    this.configService = configService;
    if (enabledProp) {
      // could be null then job always on
      this.enabled = JSON.parse(configService.get(enabledProp));
    } else {
      this.enabled = true;
    }
    this.jobName = jobName;
  }

  protected async runJob() {
    if (!this.enabled) {
      return;
    }
    // pause the job so there's only 1 running at a time
    const job = this.schedulerRegistry.getCronJob(this.jobName);
    job.stop();
    try {
      const shutdown = await this.systemService.isShutdown();
      if (shutdown) {
        this.logger.debug(`System is shutting down, not running ${this.jobName} ...`);
        return;
      }

      await this.doJob();
      this.logger.debug(`${this.jobName} completed...`);


    } catch (error) {
      this.logger.error(`Error in ${this.jobName} job: ${error}`, error.stack);
      this.bugtrackingService.notify(error);
    } finally {
      // restart the job
      job.start();
    }
  }

  // subclasses implement
  async doJob() {
    throw new Error("Method not implemented.");
  }

}
