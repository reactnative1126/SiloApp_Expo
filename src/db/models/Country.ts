import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToOne,
  Cascade,
  FloatType
} from "@mikro-orm/core";
import { InflationData } from "./InflationData";
import { Currency } from "./Currency";

@Entity()
export class Country {

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({nullable: false, index: true, length: 100, unique: true})
  name: string;

  @Property({nullable: false, index: true, length: 3, unique: true})
  countryCode: string;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @OneToMany(() => InflationData, data => data.country, { orphanRemoval: true, cascade: [Cascade.ALL]})
  inflationData = new Collection<InflationData>(this);

  // nullable = true so we can populate but will always be set
  @Property({type: FloatType, nullable: true, index: true})
  cpi: number;

  constructor(name: string, countryCode: string) {
    this.name = name;
    this.countryCode = countryCode;
  }

  addInflationData(inflationData: InflationData) {
    this.inflationData.add(inflationData);
    inflationData.country = this;
  }
}
