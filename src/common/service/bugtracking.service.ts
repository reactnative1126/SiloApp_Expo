//Nest
import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

//Util
//Mikro
import Bugsnag from "@bugsnag/js";

@Injectable()
export class BugtrackingService implements OnModuleInit {
  private readonly logger = new Logger(BugtrackingService.name);

  private enabled: boolean = false;

  constructor(
    private configService: ConfigService,
  ) {
    if (this.configService.get("ENABLE_BUGSNAG") === "true") {
      this.enabled = true;
    }
  }

  notify(error: Error) {
    if (this.enabled) {
      Bugsnag.notify(error);
    }
  }

  async onModuleInit(): Promise<any> {
    if (this.enabled) {
      this.logger.log('BugtrackingService initialized');
    } else {
      this.logger.log('BugtrackingService is disabled');
    }
  }

}
