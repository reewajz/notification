import { User } from '@itonics/core/dist/types/tenant/model';
import { NotificationBuffer } from '../../notification-converter/interfaces/NotificationBuffer';

export type UserDetails = Partial<User>;

export interface UserPreferences extends UserDetails {
  uri?: string;
  notificationChannel?: string;
  language?: string;
  excludeList?: Array<string>;
  notificationBuffer?: Array<NotificationBuffer>;
  isNotificationEnable?: boolean;
}
