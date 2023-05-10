import { AuditEventBase } from '@itonics/audit-client';
import { NotificationBuffer } from '../interfaces/NotificationBuffer';

export abstract class NotificationEventConverter {
  /**
   * Processes the audit event
   * @param auditEventBase
   */
  abstract transform(auditEventBase: AuditEventBase): Promise<NotificationBuffer>;
}
