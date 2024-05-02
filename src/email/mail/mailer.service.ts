import { Injectable, Logger } from "@nestjs/common";
import { ISendMailOptions, MailerService as NestMailerService } from "@nestjs-modules/mailer";
import { getEmailDomain } from "../../utils/misc";
import { Address } from "@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface";

export interface SendMailData {
  to: { name: string; address: string };
  from: { name: string; address: string };
  subject: string;
  text: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly nestMailerService: NestMailerService) {
    this.logger.debug(`MailerService initialized`);
  }

  async sendMail(mailData: ISendMailOptions) {
    const address = mailData.to as Address;
    const domain = getEmailDomain(address.address);
    if (domain in ['test.com', 'example.com']) {
      this.logger.debug(`Not sending email to ${address.address} because it is a test domain`);
      return;
    }
    await this.nestMailerService.sendMail(mailData);
  }
}
