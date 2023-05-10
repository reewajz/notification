import { Logger, LoggingServiceProvider, ServiceContainer } from '@itonics/core';
import { InvocationEventHandler, Lambda, LambdaConfig } from '@itonics/lambda';
import { ScheduledEvent } from 'aws-lambda';
import { config, onBoot, onInvocation, onShutdown, NotificationConverterConfig } from '../../common/config/config';
import { CommonServiceProviders } from '../../common/providers/CommonServiceProviders';
import { NotificationConverterProvider } from '../providers/NotificationConverterProvider';
import { NotificationAggregator } from '../services/notification-aggregator/NotificationAggregator';

/**
 *  Triggered by cloudwatch scheduled events which will aggregates notification
 */

export const lambdaConfig: LambdaConfig<NotificationConverterConfig> = {
  serviceProviders: [new LoggingServiceProvider(), new CommonServiceProviders(), new NotificationConverterProvider()],

  eventHandlers: [
    new InvocationEventHandler((container: ServiceContainer) => {
      const logger: Logger = container.get(Logger);

      logger.info('Inside notification-aggregator lambda!!');

      const notificationAggregator = container.get(NotificationAggregator);

      return async (event: ScheduledEvent) => {
        await notificationAggregator.aggregate();
        logger.info('Notification Aggregation completed');
      };
    })
  ],
  config,
  onBoot,
  onShutdown,
  onInvocation
};

export const handler = new Lambda(lambdaConfig).handlerFunction;
