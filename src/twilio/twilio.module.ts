import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "../common/common.module";
import { TwilioService } from "./service/twilio.service";


@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
  ],
  providers: [TwilioService],
  exports: [TwilioService]
})
export class TwilioModule {
}
