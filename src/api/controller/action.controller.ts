import { Body, Controller, Logger, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ActionProcessorService } from "../service/actionProcessor.service";
import { getSuccessResponse } from "../../common/common.types";
import { AuthGuard } from "./util/auth.guard";
const jwt = require("jsonwebtoken");

@Controller("api/chain/action")
@ApiTags("action")
export class ActionController {
  private readonly logger = new Logger(ActionController.name);

  constructor(private readonly actionService: ActionProcessorService) {
  }

  @Put("/:actionId/confirm")
  @UseGuards(AuthGuard)
  async confirmAction(@Param('actionId') actionId: number, @Req() req) {
    const user = req.user;
    // confirm the action and get back the new user (with updated balances)
    const userDto = await this.actionService.confirmAction(user.id, actionId);
    return getSuccessResponse({
      user: userDto
    });
  }

}
