import { Body, Controller, Logger, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserInfo } from "../dto/internal.dto";
import { UserService } from "../service/user.service";
import { ActionProcessorService } from "../service/actionProcessor.service";

@Controller("api/chain/internal")
@ApiTags("system")
export class InternalController {
  private readonly logger = new Logger(InternalController.name);

  constructor(private readonly userService: UserService,
              private readonly actionService: ActionProcessorService) {
  }

  @Put("/init-user")
  async initUser(@Body() userInfo: UserInfo) {
    this.logger.debug(`got init-user request for user: ${userInfo.userId}`);

    // await this.actionService.activateUser(userInfo.userId);
    // await this.actionService.fundUser(userInfo.userId, 'welcome');

    return {
      success: true
    };
  }

}
