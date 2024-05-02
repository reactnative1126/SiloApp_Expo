import { Entity, FloatType, IntegerType, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { Country } from "./Country";

@Entity()
@Unique({ properties: ["country", "year"] })
export class InflationData {

  @PrimaryKey()
  id!: number;

  @Property({ type: IntegerType, nullable: false, index: true })
  year: number;

  @Property({ type: FloatType, nullable: false, index: true })
  rate: number;

  @ManyToOne(() => Country, {nullable: false})
  country: Country;

  constructor(year: number, rate: number, country: Country) {
    this.year = year;
    this.rate = rate;
    this.country = country;
  }
}
