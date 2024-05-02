//Nest
import {Module} from '@nestjs/common';
import {SolanaModule} from './solana/solana.module';
import {ConfigModule} from '@nestjs/config';
import {AnalyticsModule} from './analytics/analytics.module';
import {CommonModule} from './common/common.module';
import { LoaderModule } from "./_loader/loader.module";
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {DbModule} from './db/db.module';
import {ApiModule} from './api/api.module';
import {JobsModule} from './jobs/jobs.module';
import {ScheduleModule} from '@nestjs/schedule';
import { EmailModule } from "./email/email.module";
import { TwilioModule } from "./twilio/twilio.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EmailModule,
    AnalyticsModule,
    // TransactionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot({}),
    CommonModule,
    DbModule,
    LoaderModule,
    ApiModule,
    SolanaModule,
    JobsModule,
    TwilioModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
