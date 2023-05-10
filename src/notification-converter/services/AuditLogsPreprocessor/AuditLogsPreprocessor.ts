import { AuditEvent } from '@itonics/audit-client';
import { NotificationEventConfig } from '../../interfaces/NotificationEventConfig';

export abstract class AuditLogsPreprocessor {
  /**
   * Preprocess audit logs
   * @param auditEvent
   * @param source
   */
  abstract process(auditEvent: AuditEvent, source: string): Promise<NotificationEventConfig>;
}
