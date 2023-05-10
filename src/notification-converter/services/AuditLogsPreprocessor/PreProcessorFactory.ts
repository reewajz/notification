import { Logger } from '@itonics/core';
import { NotificationConverterConfig } from '../../../common/config/config';
import { NotificationEventConfigService } from '../NotificationEventConfigService';
import { AuditLogsPreprocessor } from './AuditLogsPreprocessor';
import { CommentPreProcessor } from './CommentPreProcessor';
import { ElementsPreProcessor } from './ElementsPreProcessor';

export class PreProcessorFactory {
  constructor(
    private readonly logger: Logger,
    private readonly notificationEventConfigService: NotificationEventConfigService,
    private readonly config: NotificationConverterConfig
  ) {}

  public create(source: string) {
    let auditLogsPreprocessor: AuditLogsPreprocessor;
    if (source === 'ELEMENT') {
      auditLogsPreprocessor = new ElementsPreProcessor(this.logger, this.notificationEventConfigService);
    } else if (source === 'COMMENT') {
      auditLogsPreprocessor = new CommentPreProcessor(this.logger, this.notificationEventConfigService, this.config);
    }
    return auditLogsPreprocessor;
  }
}
