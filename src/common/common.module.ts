import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {FactoryService} from './service/factory.service';
import {DbModule} from '../db/db.module';
import { BugtrackingService } from "./service/bugtracking.service";

@Module({
  imports: [ConfigModule, DbModule],
  providers: [ConfigService, FactoryService, BugtrackingService],
  exports: [FactoryService, BugtrackingService],
})
export class CommonModule {}
