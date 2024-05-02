import { Body, Controller, HttpCode, Logger, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EmailCaptureService } from "../service/emailCapture.service";
import { EmailInfo } from "../dto/marketing.dto";

@Controller("api/chain/marketing")
@ApiTags("marketing")
export class MarketingController {
  private readonly logger = new Logger(MarketingController.name);

  constructor(private readonly emailService: EmailCaptureService) {
  }

  @Post("/email")
  @HttpCode(200)
  async saveEmail(@Body() emailInfo: EmailInfo) {
    this.logger.debug(`got saveEmail request: ${emailInfo}`);
    const savedEmail = await this.emailService.saveEmail(emailInfo.email, emailInfo.system);
    this.logger.debug(`saved email: ${savedEmail}`);
    return {
      success: true
    };
  }
}
