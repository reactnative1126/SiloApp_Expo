import { Injectable, Logger } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "../../api/service/email.service";
import { MailerService } from "../../email/mail/mailer.service";
import { JOBS } from "../jobs.constants";
import { EmailRecord, EmailStatus } from "../../db/models/EmailRecord";


// job to gather all unsent messages and send them to team@stache.io

@Injectable()
export class MailerJob {
  private readonly logger = new Logger(MailerJob.name);

  private enabled: boolean;

  constructor(
    private configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly emailService: EmailService,
    private readonly mailerService: MailerService
  ) {
    this.enabled = JSON.parse(configService.get("ENABLE_MAILER_JOB"));
    if (this.enabled) {
      this.logger.log("Mailer enabled!");
    } else {
      this.logger.log("Mailer disabled");
    }
  }

  @Cron("*/13 * * * * *", {
    name: JOBS.MAILER_JOB
  })
  async processEmails() {
    if (!this.enabled) {
      return;
    }
    const job = this.schedulerRegistry.getCronJob(JOBS.MAILER_JOB);
    job.stop();

    let emails: EmailRecord[] = null;
    let emailRecordIds: number[] = null;

    // todo: this needs to loop until no pending emails are returned

    try {
      // Gather and format emailRecords in preparation to be sent as mail
      emails = await this.emailService.getUnsentEmails(10);
      if (emails.length === 0) {
        // cancel
        job.start();
        return;
      }
      emailRecordIds = emails.map((emailRecord) => emailRecord.id);
      await this.emailService.updateEmailRecordsStatus(emailRecordIds, EmailStatus.PROCESSING);
    } catch (error) {
      this.logger.error("Error getting unsent emails or marking unset as being processed. Cancelling...", error);
      job.start();
      return;
    }

    for (const email of emails) {
      this.logger.debug(`Sending email to ${email.recipientAddress}...`);
      try {
        const emailData = email.toSendMailOptions();
        await this.mailerService.sendMail(emailData);
        await this.emailService.updateProcessedEmail(email.id);
      } catch (error) {
        this.logger.error(`Error sending email to ${email.recipientAddress}:`, error);
        await this.emailService.updateErroredEmail(email.id, error.toString());
      }
    }

    // turn the job back on
    job.start();
  }
}
