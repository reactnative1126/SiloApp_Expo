import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"; // Make sure to configure environment variables
import { Twilio } from "twilio";

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  private twilioClient: Twilio;
  private twilioVerifyServiceSid: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioClient = new Twilio(
      this.configService.get("TWILIO_ACCOUNT_SID"),
      this.configService.get("TWILIO_AUTH_TOKEN")
    );
    this.twilioVerifyServiceSid = this.configService.get("TWILIO_VERIFY_SERVICE_SID");
  }

  async sendVerificationSMS(phoneNumber: string, channel: string = "sms") {
    try {
      const verification = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
        .verifications
        .create({ to: phoneNumber, channel });

      return verification.status;
    } catch (error) {
      this.logger.error(`Error sending verification SMS to ${phoneNumber}`, error);
      // todo: bugsnag
      // Handle error appropriately
      throw error;
    }
  }

  async verifyCode(phoneNumber: string, code: string) {
    try {
      const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
        .verificationChecks
        .create({ to: phoneNumber, code });

      return verificationCheck.status === "approved";
    } catch (error) {
      this.logger.error(`Error verifying code ${code} for phone number ${phoneNumber}`, error);
      //todo: bugsnag
      // Handle error appropriately
      throw error;
    }
  }
}
