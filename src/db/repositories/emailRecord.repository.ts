import {EntityRepository} from '@mikro-orm/postgresql';
import {QueryOrder} from '@mikro-orm/core';
import { EmailRecord, EmailStatus } from '../models/EmailRecord';

export class EmailRecordRepository extends EntityRepository<EmailRecord> {

    async findByStatus(status: EmailStatus, limit: number){
        return await this.find(
            {status},
            {
                limit,
                orderBy: {createdAt: QueryOrder.ASC}
            }
        );
    }

    async updateEmailRecordStatus(ids: number[], toStatus: EmailStatus){
        const qb = this.createQueryBuilder();
        return await qb
            .update({status: toStatus})
            .where({
                id: {$in: ids}
            })
    }

    async updateProcessedEmail(id: number){
        const qb = this.createQueryBuilder();
        return await qb
            .update({
                status: EmailStatus.SENT,
                sentAt: new Date(Date.now())
            })
            .where({id})
    }

    async updateErroredEmail(id: number, error: string){
        const qb = this.createQueryBuilder();
        return await qb
            .update({
                status: EmailStatus.ERROR,
                error
            })
            .where({id})
    }
}