import { NotificationBuffer, NotificationStatus } from '../interfaces/NotificationBuffer';

/**
 *
 * Performs CRUD operations for Notification Buffer
 */
export abstract class NotificationBufferService {
  /**
   * Get Notification Buffer
   * @param notificationBuffer
   */
  abstract create(notificationBuffer: NotificationBuffer): Promise<NotificationBuffer>;

  /**
   * Get Notification buffer by uri
   * @param uri
   */
  abstract get(uri: string): Promise<NotificationBuffer>;

  /**
   * Get all Notification buffer
   */
  abstract getAll(): Promise<Array<NotificationBuffer>>;

  /**
   * Raw sql query
   * @param query
   * @param parameters
   */
  abstract query(query: string, parameters?: Array<string>): Promise<Array<NotificationBuffer>>;

  /**
   * Bulk Update Notification buffer status
   * @param status
   * @param oldStatus
   */
  abstract async bulkUpdateStatus(status: NotificationStatus, oldStatus: NotificationStatus): Promise<void>;

  abstract async bulkUpdate(ids: Array<string>, status: NotificationStatus): Promise<void>;

  /**
   * Delete Notification buffer by uri
   * @param uri
   */
  abstract delete(uri: string): Promise<void>;
}
