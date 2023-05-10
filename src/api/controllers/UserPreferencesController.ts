import { Logger } from '@itonics/core';
import { Body, Delete, Get, JsonController, OnNull, OnUndefined, Param, Post, Put } from 'routing-controllers';
import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { UserPreferencesRequest } from '../../common/requests/UserPreferencesRequest';
import { UserPreferencesService } from '../../common/services/UserPreferencesService';
import { UserPreferencesNotFoundError } from './UserPreferencesNotFoundError';

/**
 * @apiDefine Notification User Preferences CRUD controller
 */
@JsonController('/preferences')
export class UserPreferencesController {
  constructor(private readonly logger: Logger, private readonly userPreferencesService: UserPreferencesService) {}

  /**
   * @api {Get} /notification/preferences/:uri Gets user preferences
   * @apiVersion 1.0.0
   *
   * @apiName GetUserPreferences
   * @apiGroup Notification
   *
   *
   * @apiParam {string} uri Uri of  the User
   *
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *     "uri": "ab54be24-d255-4725-9391-f5794f453c24",
   *     "notificationChanel": "email",
   *     "language": "en",
   *     "excludeList": null,
   *     "isNotificationEnable": true
   *   }
   *
   */
  @Get('/:uri')
  @OnUndefined(UserPreferencesNotFoundError)
  @OnNull(UserPreferencesNotFoundError)
  public async get(@Param('uri') uri: string): Promise<UserPreferences> {
    return this.userPreferencesService.get(uri);
  }

  /**
   * @api {Post} /notification/preferences Create user preferences
   * @apiVersion 1.0.0
   *
   * @apiName CreateUserPreferences
   * @apiGroup notification
   *
   * @apiDescription
   * Saves user preferences
   *
   * @apiParam {string} UserUri
   * @apiParam {Object} userPreferences  UserPreference object to be created
   *
   *
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *     "uri": "ab54be24-d255-4725-9391-f5794f453c24",
   *     "notificationChanel": "email",
   *     "language": "en",
   *     "excludeList": null,
   *     "isNotificationEnable": true
   *   }
   */
  @Post('/')
  public async create(@Body({ required: true }) userPreferences: UserPreferencesRequest): Promise<UserPreferences> {
    return this.userPreferencesService.create(userPreferences);
  }

  /**
   * @api {Put} /notification/preferences Update user preferences
   * @apiVersion 1.0.0
   *
   * @apiName UpdateUserPreferences
   * @apiGroup notification
   *
   * @apiDescription
   * Updates user preferences
   *
   * @apiParam {string} UserUri
   * @apiParam {Object} userPreferences  UserPreference object to be updated
   *
   *
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *     "uri": "ab54be24-d255-4725-9391-f5794f453c24",
   *     "notificationChanel": "email",
   *     "language": "en",
   *     "excludeList": null,
   *     "isNotificationEnable": true
   *    }
   */
  @Put('/')
  public async update(@Body({ required: true }) userPreferences: UserPreferencesRequest): Promise<UserPreferences> {
    return this.userPreferencesService.update(userPreferences);
  }

  /**
   * @api {Delete} /notification/preferences Delete user preferences
   * @apiVersion 1.0.0
   *
   * @apiName DeleteUserPreferences
   * @apiGroup notification
   *
   * @apiDescription
   * Delete user preferences
   *
   * @apiParam {string} UserUri
   */
  // skipped until cascade is set to true
  // @Delete('/:uri')
  // @OnUndefined(204)
  // public async delete(@Param('uri') uri: string): Promise<void> {
  //   return this.userPreferencesService.delete(uri);
  // }
}
