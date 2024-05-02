import { jwtConstants } from "./api-constants";

// modules
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { CommonModule } from "../common/common.module";
import { AnalyticsModule } from "../analytics/analytics.module";
import { ConfigModule } from "@nestjs/config";

// services
import { EmailCaptureService } from "./service/emailCapture.service";

// services/controllers
import { SystemService } from "./service/system.service";
import { MarketingController } from "./controller/marketing.controller";
import { SolanaModule } from "../solana/solana.module";
import { SystemController } from "./controller/system.controller";
import { EmailService } from "./service/email.service";
import { EmailModule } from "../email/email.module";
import { InternalController } from "./controller/internal.controller";
import { UserService } from "./service/user.service";
import { TransactionService } from "./service/transaction.service";
import { ActionProcessorService } from "./service/actionProcessor.service";
import { ActionController } from "./controller/action.controller";
import { AccountController } from "./controller/account.controller";
import { AccountService } from "./service/account.service";
import { SavingService } from "./service/saving.service";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";
import { AuthGuard } from "./controller/util/auth.guard";
import { ContactsController } from "./controller/contacts.controller";
import { LoaderModule } from "../_loader/loader.module";
import { TransferService } from "./service/transfer.service";
import { TransferController } from "./controller/transfer.controller";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilter } from "./controller/util/httpexception.filter";
import { ActionService } from "./service/action.service";
import { TransferProcessorService } from "./service/transferprocessor.service";
import { UserController } from "./controller/user.controller";

@Module({
  controllers: [
    MarketingController,
    SystemController,
    ActionController,
    AccountController,
    ContactsController,
    AuthController,
    TransferController,
    UserController,
    InternalController    // called by brain-fi (flask on same server)
  ],
  providers: [
    SystemService,
    AuthGuard,
    AuthService,
    EmailCaptureService,
    EmailService,
    TransactionService,
    ActionProcessorService,
    ActionService,
    AccountService,
    SavingService,
    UserService,
    TransferService,
    TransferProcessorService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ],
  imports: [
    ConfigModule,
    CommonModule,
    DbModule,
    LoaderModule,
    SolanaModule,
    EmailModule,
    AnalyticsModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: "48h"
      }
    })
  ],
  exports: [EmailService, SystemService, ActionProcessorService, UserService, TransferService, TransferProcessorService]
})
export class ApiModule {
}
