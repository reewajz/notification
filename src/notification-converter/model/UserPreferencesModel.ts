import { generateUri } from '@itonics/core';
import { BeforeInsert, Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { NotificationBufferModel } from './NotificationBufferModel';

@Entity({ schema: 'notification', name: 'user_preferences' })
export class UserPreferencesModel implements UserPreferences {
  @PrimaryColumn()
  uri: string;

  @Column()
  notificationChannel: string;

  @Column()
  language: string;

  @ManyToMany(() => NotificationBufferModel, (notificationBuffer) => notificationBuffer.userPreferences)
  notificationBuffer: Array<NotificationBufferModel>;

  @Column({ type: 'jsonb' })
  excludeList: Array<string>;

  @Column()
  isNotificationEnable: boolean;

  @BeforeInsert()
  public beforeInsert() {
    this.uri = this.uri || generateUri();
  }
}
