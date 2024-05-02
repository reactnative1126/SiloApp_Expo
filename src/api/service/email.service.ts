import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getSuccessResponse, ServiceResponse } from "../../common/common.types";
import { EmailRecordRepository } from "../../db/repositories/emailRecord.repository";
import { EmailRecord, EmailStatus, EmailType } from "../../db/models/EmailRecord";

import handlebars from "handlebars";
import fs from "fs";
import path from "path";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly SYSTEM_NAME: string;
  private readonly SYSTEM_EMAIL: string;

  private readonly testDomains = ["example.com", "test.com"];

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
    private readonly emailRecordRepository: EmailRecordRepository
  ) {
    this.SYSTEM_NAME = this.configService.get("MAIL_SYSTEM_NAME");
    this.SYSTEM_EMAIL = this.configService.get("MAIL_SYSTEM_ADDRESS");
  }

  isTestEmail(emailaddress: string): boolean {
    const domain = emailaddress.trim().toLowerCase().split("@")[1];
    return this.testDomains.some((d) => domain.endsWith(d)); // Check if the domain ends with any of the domains in the array
  }


  @UseRequestContext()
  async createEmail(recipientName: string = null, recipientAddress: string, type: EmailType, subject: string, emailData: object = {}): Promise<EmailRecord | null> {
    const isTestDomain = this.isTestEmail(recipientAddress);
    if (isTestDomain) {
      this.logger.debug(`Skipping email to test domain: ${recipientAddress}`);
      return null;
    }
    let htmlTemplateSource = fs.readFileSync(path.join(__dirname, `/email-templates/${type}-html.hbs`), "utf8");
    let textTemplateSource = fs.readFileSync(path.join(__dirname, `/email-templates/${type}-text.hbs`), "utf8");
    // switch (type) {
    //   case EmailType.USER_INVITE_WITH_FUNDS:
    //   case EmailType.WELCOME:
    //   case EmailType.INVITE_BONUS:
    //   case EmailType.DEPOSIT_RECEIVED:
    //     htmlTemplateSource = fs.readFileSync(path.join(__dirname, `/email-templates/${type}-html.hbs`), "utf8");
    //     textTemplateSource = fs.readFileSync(path.join(__dirname, `/email-templates/${type}-text.hbs`), "utf8");
    //     break;
    //   default:
    //     this.logger.error(`Unhandled email type: ${type}`);
    //     return null;
    // }
    // todo: init these at startup
    const htmlTemplate = handlebars.compile(htmlTemplateSource);
    const textTemplate = handlebars.compile(textTemplateSource);
    const htmlBody = htmlTemplate(emailData);
    const textBody = textTemplate(emailData);
    return await this.saveEmailRecord(
      this.SYSTEM_NAME,
      this.SYSTEM_EMAIL,
      textBody,
      htmlBody,
      recipientName,
      recipientAddress,
      type,
      subject
    );
  }

  // @UseRequestContext()
  // async createTestEmail(to: string, body: string): Promise<ServiceResponse<true>> {
  //   return await this.saveEmailRecord(
  //     this.SYSTEM_NAME,
  //     this.SYSTEM_EMAIL,
  //     body,
  //     null,
  //     null,
  //     to,
  //     EmailType.FEEDBACK,
  //     "test email"
  //   );
  // }

  private async saveEmailRecord(
    senderName: string,
    senderAddress: string,
    body: string | null,
    htmlBody: string | null,
    recipientName: string,
    recipientAddress: string,
    emailType: EmailType,
    subject: string
  ): Promise<EmailRecord> {

    const email = new EmailRecord(
      senderName,
      senderAddress,
      recipientName,
      recipientAddress,
      body,
      htmlBody,
      subject,
      emailType,
      EmailStatus.PENDING
    );
    await this.emailRecordRepository.persistAndFlush(email);
    return email;
  }

  @UseRequestContext()
  async getUnsentEmails(limit: number): Promise<EmailRecord[]> {
    const emailRecords = await this.emailRecordRepository.findByStatus(EmailStatus.PENDING, limit);
    return emailRecords;
  }

  @UseRequestContext()
  async updateEmailRecordsStatus(ids: number[], toStatus: EmailStatus): Promise<number[]> {
    await this.emailRecordRepository.updateEmailRecordStatus(ids, toStatus);
    return ids;
  }

  @UseRequestContext()
  async updateProcessedEmail(id: number): Promise<number> {
    await this.emailRecordRepository.updateProcessedEmail(id);
    return id;
  }

  @UseRequestContext()
  async updateErroredEmail(id: number, error: string): Promise<number> {
    await this.emailRecordRepository.updateErroredEmail(id, error);
    return id;
  }
}
