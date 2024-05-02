import { Body, Controller, Get, Logger, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FactoryService } from "../../common/service/factory.service";
import { UserService } from "../service/user.service";
import { getSuccessResponse } from "../../common/common.types";
import { AccountService } from "../service/account.service";
import { AuthGuard } from "./util/auth.guard";
import { NotificationSettingsDto, UpdateUserDto } from "../dto/dto.types";

@Controller("api/chain/user")
@ApiTags("user")
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly accountService: AccountService,
              private readonly userService: UserService,
              private readonly factoryService: FactoryService) {
  }

  @Get("/notifications")
  @UseGuards(AuthGuard)
  async getNotifications(@Req() req) {
    const user = req.user;
    // todo: fix this when we have notifications
    const dummyResponse = {
      numNew: 3,
      notifications: [
        {
          id: 3,
          image: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          status: "Accepted",
          actions: ["Accept", "Ignore"],
          actionStatus: "Accepted",
          type: "CIRCLE_INVITE",
          counterparty: "@alexbrown",
          counterpartyId: 33,
          message: "Invited you to the Savings Circle 'Brown Family'",
          createdAt: 1701207776134,
          isNew: true
        },

        {
          id: 2,
          image: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          status: null,
          actions: null,
          actionStatus: null,
          type: "RECEIVED_FUNDS",
          counterparty: "@friendlyneighbor",
          counterpartyId: 48,
          message: "Sent you $15 (84,000 COP)",
          createdAt: 1701207776134,
          isNew: false
        },

        {
          id: 1,
          image: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          status: null,
          actions: null,
          actionStatus: null,
          type: "SENT_FUNDS",
          counterparty: "@jonathan",
          counterpartyId: 33,
          message: "You sent $10 (45,000 COP)",
          createdAt: 1701207776134,
          isNew: false
        }
      ]
    };
    return getSuccessResponse(dummyResponse);
  }

  @Put("/notifications/clear")
  @UseGuards(AuthGuard)
  async clearNewNotifications(@Req() req) {
    // todo: implement
    return getSuccessResponse();
  };

  @Put("/notification-settings")
  @UseGuards(AuthGuard)
  async setNotificationSettings(@Req() req, @Body() notificationOptionsDto: NotificationSettingsDto) {
    const user = req.user;
    const settings = await this.userService.setNotificationSettings(user.id, notificationOptionsDto);
    return getSuccessResponse({
      settings
    });
  };

  @Get("/notification-settings")
  @UseGuards(AuthGuard)
  async getNotificationSettings(@Req() req) {
    const user = req.user;
    const settings = await this.userService.getNotificationSettings(user.id);
    return getSuccessResponse({
      settings
    });
  };

  @Get("/info/:rebeltag")
  @UseGuards(AuthGuard)
  async getUserInfo(@Req() req, @Param('rebeltag') rebeltag: string) {
    const user = req.user;
    const userinfo = await this.userService.getUserInfo(rebeltag);
    return getSuccessResponse({user: userinfo});
  }

  @Put("/update")
  @UseGuards(AuthGuard)
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user;
    const userinfo = await this.userService.updateUser(user.id, updateUserDto);
    return getSuccessResponse({user: userinfo});
  }


}
