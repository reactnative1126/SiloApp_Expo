import {Module} from '@nestjs/common';
import {AnalyticsService} from './analytics.service';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  exports: [AnalyticsService],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
