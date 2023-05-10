import { InjectDependencies, Logger } from '@itonics/core';
import { QueryRunner } from 'typeorm';
import { NotificationStatus } from '../../notification-converter/interfaces/NotificationBuffer';
import { NotFoundException } from '../exceptions/NotFoundException';
import { UserPreferences } from '../interfaces/UserPreferences';
import { UserPreferencesRepository } from '../repositories/UserPreferencesRepository';
import { Utils } from '../utils/Utils';
import { UserPreferencesService } from './UserPreferencesService';

@InjectDependencies
export class UserPreferencesServiceImpl implements UserPreferencesService {
  constructor(private readonly userPreferencesRepository: UserPreferencesRepository, private readonly logger: Logger) {}

  public async create(userPreferences: UserPreferences): Promise<UserPreferences> {
    this.logger.info('user preferences::', userPreferences);
    const response = await this.get(userPreferences.uri);
    if (!!response) {
      this.logger.debug('user preference already exists ', userPreferences);
      return response;
    }
    return this.createUserPreference(userPreferences);
  }

  public get(uri: string): Promise<UserPreferences> {
    return this.userPreferencesRepository.findOne(uri);
  }

  public async getAllByStatusGroupByRecipient(status: NotificationStatus): Promise<Array<UserPreferences>> {
    return this.userPreferencesRepository.query(
      `WITH NOTIFICATION_BUFFER_BY_RECIPIENT AS (
                   Select
                      NBR."userPreferencesUri",
                      jsonb_agg(
                        json_build_object(
                        'uri', NB.uri,
                        'subject', NB.subject,
                        'predicate',NB.predicate,
                        'object',NB.object,
                        'source',NB.source,
                        'spaceUri',NB."spaceUri",
                        'tenantUri',NB."tenantUri",
                        'status',NB."status",
                        'actionUrl',NB."actionUrl",
                        'variables',Nb."variables"
                           )
                   ) as notificationBuffer
                   from notification.notification_buffer_user_preferences_user_preferences NBR
                   INNER JOIN notification.notification_buffer NB
                   on NBR."notificationBufferUri" = NB.uri
                \twhere NB.status = $1
                   group by NBR."userPreferencesUri"
                )
                select DISTINCT NR.uri, NR.*, USR."firstName", USR."lastName", USR."email", notificationBuffer AS "notificationBuffer"
                from NOTIFICATION_BUFFER_BY_RECIPIENT NBR
                INNER JOIN notification.user_preferences NR
                on NBR."userPreferencesUri" = NR.uri
                inner join tenant.user as USR
                on USR."userUri" = NR.uri
                inner join permission.space_user as UP
                on NR."uri" = UP."userUri"
                where UP.active = 'true' AND
                NR."isNotificationEnable" = 'true';`,
      [status]
    );
  }

  public async update(userPreferences: UserPreferences): Promise<UserPreferences> {
    // const existingUserPreferences = await this.get(userPreferences.uri);
    // // if (!existingUserPreferences) {
    //   throw new NotFoundException(`User Preferences with user uri:: ${userPreferences.uri} you are trying to update does not exists`);
    // }
    return this.createUserPreference(userPreferences);
  }

  public async delete(uri: string): Promise<void> {
    await this.userPreferencesRepository.delete({ uri });
  }

  public getRecipientByEmail(email: string): Promise<Array<UserPreferences>> {
    return Utils.queryInReadCommittedTransaction<Array<UserPreferences>>(async (queryRunner: QueryRunner) => {
      return await queryRunner.query(
        `select * from notification.user_preferences
            where "mail" = $1`,
        [email]
      );
    }) as Promise<Array<UserPreferences>>;
  }

  /////////////

  private preProcessBeforeSave(userPreferences: UserPreferences) {
    // default set to true
    userPreferences.isNotificationEnable = userPreferences.hasOwnProperty('isNotificationEnable')
      ? userPreferences.isNotificationEnable
      : true;
    userPreferences.language = userPreferences.language || 'en';
    userPreferences.notificationChannel = userPreferences.notificationChannel || 'email';
  }

  private createUserPreference(userPreferences: UserPreferences) {
    this.preProcessBeforeSave(userPreferences);

    const bufferInstance = this.userPreferencesRepository.create(userPreferences);
    return this.userPreferencesRepository.save(bufferInstance);
  }
}
