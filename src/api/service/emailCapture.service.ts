//Nest
import {Injectable, Logger, OnModuleInit} from '@nestjs/common';

//Mikro
import {MikroORM, UseRequestContext} from '@mikro-orm/core';
import {EntityManager, EntityRepository} from '@mikro-orm/postgresql';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EmailCapture} from '../../db/models/Email';

@Injectable()
export class EmailCaptureService implements OnModuleInit {
  private readonly logger = new Logger(EmailCaptureService.name);

  @InjectRepository(EmailCapture)
  private emailRepository: EntityRepository<EmailCapture>;

  constructor(private readonly orm: MikroORM, private readonly em: EntityManager) {}

  @UseRequestContext()
  async onModuleInit(): Promise<any> {
    this.logger.log('EmailService initialized');
  }

  @UseRequestContext()
  async saveEmail(email: string, system: string = null): Promise<EmailCapture> {
    const newEmail = new EmailCapture(email, system);
    await this.emailRepository.persistAndFlush(newEmail);
    this.logger.debug(`saved new email: ${newEmail}`);
    return newEmail;
  }
}
