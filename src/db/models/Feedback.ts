import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";

// this is only here for schema definition. used by the tensor app (flask)
@Entity()
export class Feedback {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  createdAt: Date;

  @Property({ index: true, nullable: true })
  rating: number;

  @Property({ nullable: true, type: "text" })
  comment: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  constructor(user: User, rating: number, comment: string) {
    this.user = user;
    this.createdAt = new Date();
    this.rating = rating;
    this.comment = comment;
  }
}
