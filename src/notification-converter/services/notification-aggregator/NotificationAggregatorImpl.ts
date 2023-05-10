import { InjectDependencies, Logger } from '@itonics/core';
import { SqsService } from '../../../common/aws/sqs/SqsService';
import { UserPreferences } from '../../../common/interfaces/UserPreferences';
import { UserPreferencesService } from '../../../common/services/UserPreferencesService';
import { Utils } from '../../../common/utils/Utils';
import { NotificationStatus } from '../../interfaces/NotificationBuffer';
import { NotificationBufferService } from '../NotificationBufferService';
import { NotificationAggregator } from './NotificationAggregator';

@InjectDependencies
export class NotificationAggregatorImpl implements NotificationAggregator {
  private readonly LIMIT: number = 10;
  constructor(
    private readonly notificationBufferService: NotificationBufferService,
    private readonly recipientService: UserPreferencesService,
    private readonly sqsService: SqsService,
    private readonly logger: Logger
  ) {}

  public async aggregate(): Promise<void> {
    try {
      const notifications = await this.recipientService.getAllByStatusGroupByRecipient(NotificationStatus.waitingForAggregation);
      this.logger.info('Aggregated notification::', notifications);

      if (notifications.length) {
        await this.pushNotificationBufferToSQS(notifications);
      }

      // Fixme: need to refactor
      await this.updateStatus();
    } catch (error) {
      this.logger.error('Error received while submitting notification', error);
    }
  }

  ///////////////////////
  private async updateStatus() {
    await this.notificationBufferService.bulkUpdateStatus(NotificationStatus.aggregated, NotificationStatus.waitingForAggregation);
  }

  private async pushNotificationBufferToSQS(notification: Array<UserPreferences>): Promise<void> {
    if (notification.length <= this.LIMIT) {
      await this.sendNotificationToQueue(notification);
    } else {
      const notificationChunk: Array<Array<UserPreferences>> = Utils.chunk<UserPreferences>(notification, this.LIMIT);
      await Promise.all(
        notificationChunk.map(async (notifications) => {
          await this.sendNotificationToQueue(notifications);
        })
      );
    }
  }

  private async sendNotificationToQueue(notification: Array<UserPreferences>) {
    // fixme: get env from config
    await this.sqsService.sendMessage(process.env.NOTIFICATION_QUEUE_URL, JSON.stringify(notification));
  }
}
