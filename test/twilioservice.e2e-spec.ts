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
import { TwilioService } from "../src/twilio/service/twilio.service";
import { TwilioModule } from "../src/twilio/twilio.module";

describe("Twilio", () => {
  let logger = new Logger("twilio");

  let app: INestApplication;

  let twilioService: TwilioService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envFilePath: ".env.test",
            isGlobal: true
          }),
          CommonModule,
          ConfigModule,
          TwilioModule,
          MikroOrmModule.forRoot(),
          DbModule,
        ],
        providers: [FactoryService]
      })
      .setLogger(new ConsoleLogger())
      .compile();

    app = module.createNestApplication();
    await app.init();

    const factoryService = module.get(FactoryService);
    twilioService = module.get(TwilioService);
  });

  const phone = "+17033079508";
  const code = "13900";

  it("should send a verification text message", async () => {
    const response = await twilioService.sendVerificationSMS(phone);
    console.log('sent verification sms: ', response);
  });

  // it("should verify a text message code", async () => {
  //   const response = await twilioService.verifyCode(phone, code);
  //   console.log("response: ", response);
  // });


});
