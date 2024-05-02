import {Entity, PrimaryKey, Property} from '@mikro-orm/core';

// just a quickndirty class to store emails
@Entity()
export class EmailCapture {
  @PrimaryKey()
  id!: number;

  @Property({nullable: false, name: 'email', index: true})
  email: string;

  @Property({nullable: true, index: true})
  system: string;

  constructor(email, system = null) {
    this.email = email;
    this.system = system;
  }
}
