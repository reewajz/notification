import { ServiceProvider, ServiceRegistration } from '@itonics/core';
import { getCustomRepository } from 'typeorm';
import { config } from '../../common/config/config';
import { NotificationConfig } from '../lambda/tokens';
import { NotificationBufferRepository } from '../repositories/NotificationBufferRepository';
import { NotificationBufferService } from '../services/NotificationBufferService';
import { NotificationBufferServiceImpl } from '../services/NotificationBufferServiceImpl';
import { NotificationEventConfigService } from '../services/NotificationEventConfigService';
import { NotificationEventConfigServiceImpl } from '../services/NotificationEventConfigServiceImpl';
import { NotificationEventConverter } from '../services/NotificationEventConverter';
import { NotificationEventConverterImpl } from '../services/NotificationEventConverterImpl';
import { NotificationAggregator } from '../services/notification-aggregator/NotificationAggregator';
import { NotificationAggregatorImpl } from '../services/notification-aggregator/NotificationAggregatorImpl';

export class NotificationConverterProvider implements ServiceProvider {
  registers(): Array<ServiceRegistration> {
    return [
      {
        provide: NotificationConfig,
        use: config
      },
      {
        provide: NotificationEventConverter,
        use: NotificationEventConverterImpl
      },
      {
        provide: NotificationEventConfigService,
        use: NotificationEventConfigServiceImpl
      },
      {
        provide: NotificationBufferService,
        use: NotificationBufferServiceImpl
      },
      {
        provide: NotificationAggregator,
        use: NotificationAggregatorImpl
      },
      {
        provide: NotificationBufferRepository,
        factory() {
          return getCustomRepository(NotificationBufferRepository);
        }
      }
    ];
  }
}
