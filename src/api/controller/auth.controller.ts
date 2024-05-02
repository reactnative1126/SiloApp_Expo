import { Body, Controller, Logger, Param, Post, Req, UseFilters, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { getSuccessResponse } from "../../common/common.types";
import { AuthGuard } from "./util/auth.guard";
import { UserService } from "../service/user.service";
import { LoginDto, PhoneVerificationDto, PhoneVerificationRequestDto, PinDto, RegisterUserDto } from "../dto/dto.types";
import { ValidationExceptionFilter } from "./util/validationexception.filter";

@Controller("api/chain/auth")
@ApiTags("action")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly userService: UserService,
              private readonly authGuard: AuthGuard) {
  }

  @Post("/register")
  @UseFilters(ValidationExceptionFilter)
  async register(@Body() registerDto: RegisterUserDto) {
    const session = await this.userService.register(registerDto);
    return getSuccessResponse(session);
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto) {
    const session = await this.userService.login(loginDto.username, loginDto.password);
    return getSuccessResponse(session);
  }

  @Post("/logout")
  @UseGuards(AuthGuard)
  async logout(@Req() req) {
    const user = req.user;
    const loggedOut = await this.userService.logout(user.id);
    return getSuccessResponse();
  }

  @Post('/phone-verification-request')
  async sendPhoneVerification(@Body() phoneDto: PhoneVerificationRequestDto) {
    // todo: implement
    return getSuccessResponse({
      requestId: 1,
    });
  }

  @Post('/phone-verification')
  async verifyPhone(@Body() phoneDto: PhoneVerificationDto) {
    // todo: implement
    return getSuccessResponse();
  }

  @Post("/verify-email/:emailCode")
  @UseGuards(AuthGuard)
  async verifyEmail(@Req() req, @Param('emailCode') emailCode: string) {
    const user = req.user;
    const result = await this.userService.confirmEmail(user.id, emailCode);
    const response = {
      success: result,
    };
    if (!result) {
      response['message'] = 'Invalid email confirmation code.';
    }
    return response;
  }

  @Post("/verify-pin")
  @UseGuards(AuthGuard)
  async verifyPin(@Body() pinDto: PinDto, @Req() req) {
    const user = req.user;
    const result = await this.userService.confirmPin(user.id, pinDto.pin);
    return {
      success: result,
      message: result ? 'Pin verified.' : 'Invalid PIN.'
    };
  }

  @Post("/change-pin")
  @UseGuards(AuthGuard)
  async changePin(@Body() pinDto: PinDto, @Req() req) {
    const user = req.user;
    await this.userService.changePin(user.id, pinDto.pin);
    return {
      success: true,
    };
  }


  /*
  @Post("/forgot-password")
  @UseFilters(HttpExceptionFilter)
  async forgotPassword(@Req() req) {
    const userfrontUserId = this.authGuard.getUserfrontUserId(req);
    if (!userfrontUserId) {
      throw new UnauthorizedException(`You're not authorized.`);
    } else {
      const userDto = await this.authService.loginUserfrontUser(userfrontUserId);
      return getSuccessResponse({
        user: userDto
      });
    }
  }

   */


}
