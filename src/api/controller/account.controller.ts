import { Body, Controller, Get, Logger, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FactoryService } from "../../common/service/factory.service";
import { UserService } from "../service/user.service";
import { getSuccessResponse } from "../../common/common.types";
import { AccountService } from "../service/account.service";
import { AuthGuard } from "./util/auth.guard";

@Controller("api/chain/account")
@ApiTags("action")
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly accountService: AccountService,
              private readonly userService: UserService,
              private readonly factoryService: FactoryService) {
  }

  @Get("/transactions/:symbol")
  @UseGuards(AuthGuard)
  async getTransactionsForTokenSymbol(@Param("symbol") symbol: string, @Req() req) {

      const user = req.user;
      const tokenAccountDto = await this.accountService.getUserAccountTransactions(user.id, symbol);
      return getSuccessResponse({
        account: tokenAccountDto
      });
  }
}
