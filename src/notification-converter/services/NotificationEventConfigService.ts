import { Results } from '../../common/interfaces/Results';
import { NotificationEventConfig } from '../interfaces/NotificationEventConfig';

/**
 *
 * Performs CRUD operations for Notification Event Configs
 */
export abstract class NotificationEventConfigService {
  /**
   * Get Notification Event Config
   * @param uri
   * @param source
   */
  abstract get(uri: string, source: string): Promise<NotificationEventConfig>;

  /**
   * Create Notification Event Config
   * @param notificationEventConfig
   */
  abstract create(notificationEventConfig: NotificationEventConfig): Promise<NotificationEventConfig>;

  /**
   * Updates Notification Event Config
   * @param notificationEventConfig
   */
  abstract update(notificationEventConfig: NotificationEventConfig): Promise<NotificationEventConfig>;

  /**
   * Delete Notification Event Config
   * @param uri
   * @param source
   */
  abstract delete(uri: string, source: string): Promise<void>;

  /**
   * Searches Notification Event Config
   * @param notificationEventConfig
   */
  abstract search(notificationEventConfig: NotificationEventConfig): Promise<Results<NotificationEventConfig>>;
}
