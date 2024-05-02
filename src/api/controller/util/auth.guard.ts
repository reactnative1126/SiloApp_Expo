import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService } from "../../service/user.service";
import { FactoryService } from "../../../common/service/factory.service";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly userService: UserService,
    private readonly factoryService: FactoryService) {
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return await this.validateUser(request);
  }

  async validateUser(req: any): Promise<boolean> {
    const authToken = req.headers.authorization?.replace("Bearer ", "");
    if (!authToken) {
      return false;
    }
    try {
      const user = await this.userService.getUserByAuthToken(authToken);
      if (!user) {
        return false;
      } else {
        req["user"] = user;
        return true;
      }
    } catch (err) {
      this.logger.error(`auth token verification failed: ${err}`, err);
      return false;
    }
  }

  /////// userfront

  /*
  getUserfrontUserId(req: any): number | null {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    if (!accessToken) {
      return null;
    }
    try {
      const verifiedPayload: JwtPayload = jwt.verify(
        accessToken,
        this.factoryService.getJwtPubkey(),
        { algorithms: ["RS256"] },
      ) as JwtPayload;
      const exp = verifiedPayload.exp;
      if (exp < Date.now() / 1000) {
        this.logger.warn(`jwt token expired: ${exp}`);
        return null;
      } else {
        return parseInt(verifiedPayload.userId);
      }
    } catch (err) {
      this.logger.warn(`jwt token verification failed: ${err}`);
      return null;
    }
  }

  async validateUserfrontJwt(req: any): Promise<boolean> {

    // Read the JWT access token from the authorization header
    const userfrontUserId = this.getUserfrontUserId(req);
    let user = await this.userService.getUserByUserfrontUserId(userfrontUserId);
    if (!user) {
      // shouldn't happen
      this.logger.warn(`authenticated jwt token but couldn't find user by userfront id: ${userfrontUserId}`);
      return false;
    } else {
      req["user"] = user;
      return true;
    }
  }

   */
}
