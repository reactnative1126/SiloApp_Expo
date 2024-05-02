import {SqlEntityRepository} from '@mikro-orm/postgresql';
import {Injectable, Logger} from '@nestjs/common';


@Injectable()
export class AbstractRepository<T extends object> extends SqlEntityRepository<T> {
  private readonly abstractLogger = new Logger(AbstractRepository.name);

}
