import {Entity, PrimaryKey, Property} from '@mikro-orm/core';

// note: needs to be kept in sync w/genie's mappings and shit

@Entity()
export class System {

  @PrimaryKey()
  id!: number;

  @Property({index: true, nullable: false, unique: true})
  property: string;

  @Property({nullable: false})
  value: string;

  constructor(property: string, value: string) {
    this.property = property;
    this.value = value;
  }
}
