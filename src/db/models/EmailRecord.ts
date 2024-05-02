import { BeforeCreate, BeforeUpdate, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { EmailRecordRepository } from "../repositories/emailRecord.repository";
import { ISendMailOptions } from "@nestjs-modules/mailer";

export enum EmailStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  PROCESSING = "PROCESSING",
  ERROR = "ERROR",
}

export enum EmailType {
  // these map to template names - see src/server/email/templates
  // if a template doesn't exist then html won't be sent

  WELCOME = "welcome",
  INVITE_BONUS = 'invite-bonus',
  USER_INVITE_WITH_FUNDS = "user-invite-with-funds",
  DEPOSIT_RECEIVED = 'deposit-received',
  PAYMENT_SENT = 'payment-sent',
  PAYLINK_CREATED = 'paylink-created'
}

@Entity({ customRepository: () => EmailRecordRepository })
export class EmailRecord {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, index: true })
  senderName!: string;

  @Property({ nullable: false, index: true })
  senderAddress!: string;

  @Property({ index: true, nullable: true })
  recipientName: string;

  @Property({ nullable: false, index: true })
  recipientAddress!: string;

  // @ManyToOne(() => User, {nullable: true, index: true})
  // user: User;

  @Property({ index: true })
  emailType: string;

  @Property({ nullable: true })
  subject: string;

  @Property({ type: 'text', nullable: true })
  body: string;

  @Property({ type: 'text', nullable: true })
  htmlBody: string;

  @Property({ nullable: false, index: true })
  status: string;

  @Property()
  createdAt: Date;

  @Property({ nullable: true, index: true })
  sentAt: Date;

  @Property({ nullable: true })
  updatedAt: Date;

  @Property({ nullable: true })
  error: string;

  constructor(
    senderName: string,
    senderAddress: string,
    recipientName: string,
    recipientAddress: string,
    body: string,
    htmlBody: string,
    subject: string,
    emailType: EmailType,
    status?: EmailStatus
  ) {
    this.senderName = senderName;
    this.senderAddress = senderAddress;
    this.recipientName = recipientName;
    this.recipientAddress = recipientAddress;
    this.body = body;
    this.htmlBody = htmlBody;
    this.subject = subject;
    this.emailType = emailType;
    this.status = status ?? EmailStatus.PENDING;
  }

  @BeforeCreate()
  async beforeCreate() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  async updated() {
    this.updatedAt = new Date();
  }

  toSendMailOptions(): ISendMailOptions {
    const options = {
      to: { name: this.recipientName, address: this.recipientAddress },
      from: { name: this.senderName, address: this.senderAddress },
      subject: this.subject,
      text: this.body,
      html: this.htmlBody
    };
    return options;
  }
}
