import { ServiceProvider, ServiceRegistration } from '@itonics/core';
import { getCustomRepository } from 'typeorm';
import { NotificationBufferRepository } from '../../notification-converter/repositories/NotificationBufferRepository';
import { NotificationBufferService } from '../../notification-converter/services/NotificationBufferService';
import { NotificationBufferServiceImpl } from '../../notification-converter/services/NotificationBufferServiceImpl';
import { DispatcherService } from '../services/DispatcherService';
import { EmailDispatcherServiceImpl } from '../services/EmailDispatcherServiceImpl';
import { NotificationControlService } from '../services/NotificationControlService';
import { NotificationTemplateFetcherService } from '../services/NotificationTemplateFetcherService';
import { TemplateParserService } from '../services/TemplateParserService';
import { DefaultTemplateParserServiceImpl } from '../services/impl/DefaultTemplateParserServiceImpl';
import { DynamoDbNotificationControlServiceImpl } from '../services/impl/DynamoDbNotificationControlServiceImpl';
import { InMemoryNotificationTemplateFetcherService } from '../services/impl/InMemoryNotificationTemplateFetcherService';

export class NotificationDispatcherProvider implements ServiceProvider {

  registers(): Array<ServiceRegistration> {
    return [
      {
        provide: NotificationControlService,
        use: DynamoDbNotificationControlServiceImpl
      },
      {
        provide: DispatcherService,
        use: EmailDispatcherServiceImpl
      },
      {
        provide: TemplateParserService,
        use: DefaultTemplateParserServiceImpl
      },
      {
        provide: NotificationTemplateFetcherService,
        use: InMemoryNotificationTemplateFetcherService
      },
      {
        provide: NotificationBufferService,
        use: NotificationBufferServiceImpl
      },
      {
        provide: NotificationBufferRepository,
        factory() {
          return getCustomRepository(NotificationBufferRepository);
        }
      },
    ];
  }
}
