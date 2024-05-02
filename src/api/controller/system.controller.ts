import { Body, Controller, Get, HttpCode, Logger, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SystemService } from "../service/system.service";
import { getSuccessResponse } from "../../common/common.types";
import { FeedbackDto } from "../dto/dto.types";
import { AuthGuard } from "./util/auth.guard";

@Controller("api/chain/system")
@ApiTags("system")
export class SystemController {
  private readonly logger = new Logger(SystemController.name);

  constructor(private readonly systemService: SystemService) {
  }

  @Get("/info")
  @HttpCode(200)
  async getSystemInfo() {
    const data = await this.systemService.getSystemInfo();
    return {
      success: true,
      data
    };
  }

  @Get('/currencies')
  async getSupportedCurrencies() {
    const currencies = await this.systemService.getCurrencies();
    return getSuccessResponse({
      currencies
    });
  }


  @Post('/feedback')
  @UseGuards(AuthGuard)
  async submitFeedback(@Body() feedbackDto: FeedbackDto, @Req() req)  {
    const user = req.user;
    const feedback = await this.systemService.submitFeedback(user.id, feedbackDto);
    return getSuccessResponse();
  }


  @Get('/exchange-rate/:currencyCode')
  async getExchangeRate(@Param('emailCode') currencyCode: string) {
    const exchangeRate = await this.systemService.getExchangeRate(currencyCode);
    return getSuccessResponse({
      exchangeRate
    });
  }


  @Get('/exchange-rate')
  @UseGuards(AuthGuard)
  async getUserExchangeRate(@Req() req) {
    const user = req.user;
    const exchangeRate = await this.systemService.getExchangeRateForUser(user.id);
    return getSuccessResponse({
      exchangeRate
    });
  }


}
