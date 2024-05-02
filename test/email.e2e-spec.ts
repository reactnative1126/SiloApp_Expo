import { CommonModule } from "../src/common/common.module";
import { Test, TestingModule } from "@nestjs/testing";
import { ConsoleLogger, INestApplication, Logger } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ApiModule } from "../src/api/api.module";
import { FactoryService } from "../src/common/service/factory.service";
import { ConfigModule } from "@nestjs/config";
import { EmailService } from "../src/api/service/email.service";
import { DbModule } from "../src/db/db.module";
import { EmailModule } from "../src/email/email.module";
import { MailerService } from "../src/email/mail/mailer.service";
import { EmailType } from "../src/db/models/EmailRecord";

import date from "date-and-time";

describe("Mailer (email)", () => {
  let logger = new Logger("mailer");


  let app: INestApplication;

  let emailService: EmailService;
  let mailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [
          CommonModule,
          ConfigModule,
          ApiModule,
          MikroOrmModule.forRoot(),
          DbModule,
          EmailModule
        ],
        providers: [FactoryService]
      })
      .setLogger(new ConsoleLogger())
      .compile();

    logger.debug(">>>>>> Mailer test initializing...");
    app = module.createNestApplication();
    await app.init();

    logger.debug(">>> Mailer initialized");

    const factoryService = module.get(FactoryService);
    emailService = module.get(EmailService);
    mailerService = module.get(MailerService);
  });

  // it("should save a feedback emailrecord and send it", async () => {
  //   await mailerService.sendMail({
  //     to: { name: "silo", address: "silo@stache.io" },
  //     from: { name: "test", address: "test-system@geniejam.com" },
  //     subject: "test email",
  //     text: "test email"
  //   });


  it("should save an invite with funds emailrecord", async () => {
    const emailRecord = await emailService.createEmail(null, "test@plur.com", EmailType.USER_INVITE_WITH_FUNDS, "You got some fundS!", {
      sender: "test guy",
      paymentAmount: "0.40",
      rebelfiUrl: "https://rebelfi.io",
      fundAmount: "1",
    });
    const mailData = emailRecord.toSendMailOptions();
    await mailerService.sendMail(mailData);
  });


});
