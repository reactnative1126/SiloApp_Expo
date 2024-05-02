import { Body, Controller, Get, HttpCode, Logger, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { getSuccessResponse } from "../../common/common.types";
import { TransferService } from "../service/transfer.service";
import { AuthGuard } from "./util/auth.guard";
import { LoginDto, PaymentDto } from "../dto/dto.types";
import { PayTargetRequestDto } from "../../db/db.types";
import { UserService } from "../service/user.service";

@Controller("api/chain/transfers")
@ApiTags("system")
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(private readonly transferService: TransferService,
              private readonly userService: UserService) {
  }

  @Get("/claim/:claimCode")
  @HttpCode(200)
  async getPaylink(@Param("claimCode") claimCode: string) {
    const paylink = await this.transferService.getUnclaimedPaylink(claimCode);
    return getSuccessResponse({
      paylink
    });
  }

  @Post("/paylink/claim/:claimCode")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async claimPaylink(@Param("claimCode") claimCode: string, @Req() req: any) {
    const user = req.user;
    const userDto = await this.transferService.claimPaylink(user.id, claimCode);
    return getSuccessResponse({
      user: userDto
    });
  }

  @Post("/pay")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async createPayment(@Body() paymentDto: PaymentDto, @Req() req: any) {
    const user = req.user;
    const transfer = await this.transferService.createTransfer(user.id, paymentDto);
    const userDto = await this.userService.getUserDto(user.id);
    return getSuccessResponse({
      transfer,
      user: userDto
    });
  }

  @Post("/pay-target")
  @UseGuards(AuthGuard)
  async getPayTarget(@Req() req: any, @Body() payTargetRequest: PayTargetRequestDto) {
    const user = req.user;
    const payTarget = await this.transferService.getPayTarget(user.id, payTargetRequest);
    return getSuccessResponse({
      payTarget
    });
  }

}
