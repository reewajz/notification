import { InjectDependencies, Logger } from '@itonics/core';
import { NotificationBuffer, NotificationStatus } from '../interfaces/NotificationBuffer';
import { NotificationBufferModel } from '../model/NotificationBufferModel';
import { NotificationBufferRepository } from '../repositories/NotificationBufferRepository';
import { NotificationBufferService } from './NotificationBufferService';

@InjectDependencies
export class NotificationBufferServiceImpl implements NotificationBufferService {
  constructor(private readonly notificationRepository: NotificationBufferRepository, private readonly logger: Logger) {
  }

  public create(notificationBuffer: NotificationBuffer): Promise<NotificationBuffer> {
    this.logger.debug('notification buffer::', notificationBuffer);
    const bufferInstance = this.notificationRepository.create(notificationBuffer);
    return this.notificationRepository.save(bufferInstance);
  }

  public get(uri: string): Promise<NotificationBuffer> {
    return this.notificationRepository
      .createQueryBuilder('notification_buffer')
      .innerJoinAndSelect('notification_buffer.userPreferences', 'user_preferences')
      .where({ uri })
      .getOne();
  }

  public async delete(uri: string): Promise<void> {
    await this.notificationRepository.delete({ uri });
  }

  public async getAll(): Promise<Array<NotificationBuffer>> {
    return this.notificationRepository
      .createQueryBuilder('notification_buffer')
      .distinctOn(['notification_buffer.subject', 'notification_buffer.predicate', 'notification_buffer.object', 'user_preferences.uri'])
      .leftJoin('notification_buffer.userPreferences', 'user_preferences')
      .getMany();
  }

  public async query(query: string, parameters?: Array<string>): Promise<Array<NotificationBuffer>> {
    return this.notificationRepository.query(query, parameters);
  }

  public async getAllByGroupingRSPO(): Promise<Array<NotificationBuffer>> {
    return (
      this.notificationRepository
        .createQueryBuilder('notification_buffer')
        .select(['notification_buffer.subject', 'notification_buffer.predicate', 'notification_buffer.object', 'recipient.name'])
        // .leftJoin(RecipientModel, 'recipient', 'notification_buffer.recipient  = recipient')
        .leftJoin('notification_buffer.recipient', 'recipient')
        .groupBy('notification_buffer.subject')
        .addGroupBy('notification_buffer.predicate')
        .addGroupBy('notification_buffer.object')
        .addGroupBy('recipient.name')
        .getMany()
    );
  }

  public async bulkUpdateStatus(status: NotificationStatus, oldStatus: NotificationStatus): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder('notification_buffer')
      .update(NotificationBufferModel)
      .set({ status })
      .where({ status: oldStatus })
      .execute();
  }

  async bulkUpdate(uris: Array<string>, status: NotificationStatus): Promise<void> {
    if (uris.length === 0) {
      return Promise.resolve();
    }
    await this.notificationRepository
      .createQueryBuilder('notification_buffer')
      .update(NotificationBufferModel)
      .set({ status })
      // https://orkhan.gitbook.io/typeorm/docs/select-query-builder#using-parameters-to-escape-data
      .where('uri IN (:...uris)', { uris })
      .execute();
  }
}
