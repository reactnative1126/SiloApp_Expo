import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BlockTx } from "./models/BlockTx";
import { Wallet } from "./models/Wallet";
import { WalletRepository } from "./repositories/wallet.repository";
import { BlockTxRepository } from "./repositories/blocktx.repository";
import { EmailCapture } from "./models/Email";
import { EmailRecord } from "./models/EmailRecord";
import { EmailRecordRepository } from "./repositories/emailRecord.repository";
import { System } from "./models/System";
import { UserRepository } from "./repositories/user.repository";
import { User } from "./models/User";
import { TokenRepository } from "./repositories/token.repository";
import { Token } from "./models/Token";
import { TokenAccount } from "./models/TokenAccount";
import { Action } from "./models/Action";
import { UserTx } from "./models/UserTx";
import { UserTxRepository } from "./repositories/usertx.repository";
import { Msg } from "./models/Msg";
import { Chat } from "./models/Chat";
import { AccountTx } from "./models/AccountTx";
import { Contact } from "./models/Contact";
import { ContactRepository } from "./repositories/contact.repository";
import { RebelTx } from "./models/RebelTx";
import { InflationData } from "./models/InflationData";
import { Country } from "./models/Country";
import { Currency } from "./models/Currency";
import { Paylink } from "./models/Paylink";
import { CurrencyAmount } from "./models/CurrencyAmount";
import { Feedback } from "./models/Feedback";
import { TokenAccountRepository } from "./repositories/tokenaccount.repository";
import { Transfer } from "./models/Transfer";
import { TransferRepository } from "./repositories/transfer.repository";
import { SolanaAddress } from "./models/SolanaAddress";
import { SolanaAddressRepository } from "./repositories/solanaaddress.repository";
import { PendingCredit } from "./models/PendingCredit";
import { PendingDebit } from "./models/PendingDebit";

@Module({
  imports: [
    MikroOrmModule.forFeature([
      BlockTx,
      Wallet,
      EmailCapture,
      EmailRecord,
      System,
      User,
      Token,
      TokenAccount,
      Transfer,
      Action,
      RebelTx,
      UserTx,
      AccountTx,
      // just for schema definition. used by tensor app (flask)
      Chat,
      Msg,
      Contact,
      InflationData,
      Transfer,
      Currency,
      Country,
      CurrencyAmount,
      Feedback,
      Paylink,
      PendingDebit,
      PendingCredit,
      SolanaAddress
    ])
  ],
  providers: [
    WalletRepository,
    BlockTxRepository,
    EmailRecordRepository,
    TokenRepository,
    UserRepository,
    UserTxRepository,
    ContactRepository,
    TokenAccountRepository,
    SolanaAddressRepository,
    TransferRepository,
  ],
  exports: [MikroOrmModule]
})
export class DbModule {
}
