
import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { CommonModule } from "../common/common.module";
import { ConfigModule } from "@nestjs/config";
import { LoaderService } from "./service/loader.service";

@Module({
  providers: [
    LoaderService,
  ],
  imports: [
    ConfigModule,
    CommonModule,
    DbModule,
  ],
  exports: [
    LoaderService,
  ]
})

export class LoaderModule {
}
