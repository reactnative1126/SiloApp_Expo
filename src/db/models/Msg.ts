import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Chat } from "./Chat";
import { User } from "./User";

// this is only here for schema definition. used by the tensor app (flask)
@Entity()
export class Msg {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date;

  @Property({ index: true })
  role: string;   // user / ai

  @Property({ nullable: false, type: "text" })
  content: string;

  @ManyToOne(() => Chat, { nullable: false })
  chat: Chat;

  @Property({ name: "response", type: "json", nullable: true })
  response: object = {};

}
