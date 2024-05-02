import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "../common/common.module";
import { MailerModule } from "@nestjs-modules/mailer";

import { MailerService } from "./mail/mailer.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
      },
      defaults: {
        from: "\"RebelFi\" <system@rebelfi.io>"
      }
    })
  ],
  providers: [MailerService],
  exports: [MailerService]
})
export class EmailModule {
}
