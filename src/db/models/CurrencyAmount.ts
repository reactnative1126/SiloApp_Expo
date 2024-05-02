import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  FloatType
} from "@mikro-orm/core";
import { Currency } from "./Currency";

@Entity()
export class CurrencyAmount {

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: FloatType, nullable: false, default: 0 })
  amount: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @Property({type: FloatType, nullable: true, index: true})
  usdExchangeRate: number;

  constructor(tokenAmount: number, currency: Currency) {
    this.amount = tokenAmount * currency.usdExchangeRate;
    this.usdExchangeRate = currency.usdExchangeRate;
    this.currency = currency;
  }

}
