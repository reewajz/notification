import { Logger, LoggingServiceProvider, ServiceContainer } from '@itonics/core';
import { FeatureFlagServiceProvider } from '@itonics/features';
import { InvocationEventHandler, Lambda, LambdaConfig } from '@itonics/lambda';
import { ScheduledEvent } from 'aws-lambda';
import { config, onBoot, onInvocation, onShutdown, NotificationConverterConfig } from '../../common/config/config';
import { CommonServiceProviders } from '../../common/providers/CommonServiceProviders';
import { NotificationConverterProvider } from '../providers/NotificationConverterProvider';
import { NotificationEventConverter } from '../services/NotificationEventConverter';

/**
 *  This lambda reads data from event bus
 */

export const lambdaConfig: LambdaConfig<NotificationConverterConfig> = {
  serviceProviders: [
    new LoggingServiceProvider(),
    new NotificationConverterProvider(),
    new CommonServiceProviders(),
    new FeatureFlagServiceProvider()
  ],

  eventHandlers: [
    new InvocationEventHandler((container: ServiceContainer) => {
      const logger: Logger = container.get(Logger);

      logger.info('Inside notification-converter lambda!!');

      const notificationEventConverter = container.get(NotificationEventConverter);

      return async (event: ScheduledEvent) => {
        await notificationEventConverter.transform(event.detail.event);
      };
    })
  ],
  config,
  onBoot,
  onShutdown,
  onInvocation
};

export const handler = new Lambda(lambdaConfig).handlerFunction;
