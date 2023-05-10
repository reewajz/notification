import { NotificationStatus } from '../../notification-converter/interfaces/NotificationBuffer';
import { UserPreferences } from '../interfaces/UserPreferences';

/**
 *
 * Performs CRUD operations on User Preferences
 */
export abstract class UserPreferencesService {
  /**
   * Get UserPreferences
   * @param userPreferences
   */
  abstract create(userPreferences: UserPreferences): Promise<UserPreferences>;

  /**
   * Get UserPreferences by uri
   * @param uri
   */
  abstract get(uri: string): Promise<UserPreferences>;

  /**
   * Update UserPreferences
   * @param userPreferences
   */
  abstract update(userPreferences: UserPreferences): Promise<UserPreferences>;

  /**
   * Delete UserPreferences by uri
   * @param uri
   */
  abstract delete(uri: string): Promise<void>;

  /**
   * Delete UserPreferences by uri
   * @param email
   */
  abstract getRecipientByEmail(email: string): Promise<Array<UserPreferences>>;

  /**
   * Get all Notification buffer by group by recipient
   * @param status
   */
  abstract getAllByStatusGroupByRecipient(status: NotificationStatus): Promise<Array<UserPreferences>>;
}
