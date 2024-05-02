import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Msg } from "./Msg";
import { User } from "./User";
import { Action } from "./Action";

// this is only here for schema definition. used by the tensor app (flask)
@Entity()
export class Chat {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date;

  @Property({ index: true, unique: true, nullable: false })
  uuid: string;

  @OneToMany(() => Msg, (msg) => msg.chat, { orphanRemoval: true, cascade: [Cascade.ALL] })
  messages = new Collection<Msg>(this);

  @ManyToOne(() => User, { nullable: false })
  user: User;

}
