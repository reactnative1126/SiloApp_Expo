import { Entity, PrimaryKey, Property, OneToMany, Collection, Unique, FloatType } from "@mikro-orm/core";

@Entity()
export class Currency {

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({nullable: false, length: 6})
  emoji: string;

  @Property({nullable: false, index: true, length: 100, unique: true})
  name: string;

  @Property({nullable: false, index: true, length: 3, unique: true})
  code: string;

  @Property({nullable: false, index: true, length: 10, unique: true})
  locale: string;

  @Property({nullable: false, index: true, length: 10})
  decimals: number;

  // the amount of currrency == $1
  @Property({type: FloatType, nullable: true, index: true})
  usdExchangeRate: number;

  constructor(code: string, name: string, emoji: string, locale: string, decimals: number) {
    this.name = name;
    this.emoji = emoji;
    this.code = code;
    this.locale = locale;
    this.decimals = decimals;
  }
}
