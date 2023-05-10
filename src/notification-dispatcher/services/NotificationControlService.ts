import { NotificationChannel, NotificationUpdateCommand } from './NotificationUpdateModel';

export abstract class NotificationControlService {
  abstract isNotificationEnabledFor(tenantUri: string, spaceUri: string, userUri: string, type: NotificationChannel): Promise<boolean>;

  abstract enableNotificationFor(command: NotificationUpdateCommand): Promise<void>;

  abstract disableNotificationFor(command: NotificationUpdateCommand): Promise<void>;
}
