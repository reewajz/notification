import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationBuffer } from '../../notification-converter/interfaces/NotificationBuffer';
import { UserPreferences } from '../interfaces/UserPreferences';

export class UserPreferencesRequest implements UserPreferences {
  @IsString()
  @IsNotEmpty()
  uri: string;

  @IsString()
  @IsOptional()
  notificationChannel?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @IsOptional()
  excludeList?: Array<string>;

  @IsOptional()
  notificationBuffer?: Array<NotificationBuffer>;

  @IsOptional()
  @IsBoolean()
  isNotificationEnable?: boolean;
}
