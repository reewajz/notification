import { EntityRepository, Repository } from 'typeorm';
import { NotificationBufferModel } from '../model/NotificationBufferModel';

@EntityRepository(NotificationBufferModel)
export class NotificationBufferRepository extends Repository<NotificationBufferModel> {}
