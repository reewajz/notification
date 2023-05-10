import { generateUri } from '@itonics/core';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { KeyValueMap } from '../../common/interfaces/KeyValueMap';
import { NotificationBuffer, NotificationStatus } from '../interfaces/NotificationBuffer';
import { SourceType } from '../interfaces/NotificationCategories';
import { UserPreferencesModel } from './UserPreferencesModel';

@Entity({ schema: 'notification', name: 'notification_buffer' })
export class NotificationBufferModel implements NotificationBuffer {
  @PrimaryColumn()
  uri: string;

  @Column()
  subject: string;

  @Column()
  predicate: string;

  @Column()
  object: string;

  @ManyToMany(() => UserPreferencesModel, (userPreferences) => userPreferences.notificationBuffer)
  @JoinTable()
  userPreferences: Array<UserPreferencesModel>;

  @Column()
  source: SourceType;

  @Column()
  spaceUri: string;

  @Column()
  tenantUri: string;

  @Column()
  status?: NotificationStatus;

  @Column({ type: 'bigint' })
  createdOn: number;

  @Column({ type: 'bigint' })
  updatedOn: number;

  @Column({ type: 'jsonb'})
  variables: KeyValueMap;

  @Column()
  actionUrl?: string;

  @BeforeInsert()
  public beforeInsert() {
    this.uri = this.uri || generateUri();
    this.createdOn = Date.now();
  }

  @BeforeUpdate()
  public beforeUpdate() {
    this.updatedOn = Date.now();
  }
}
