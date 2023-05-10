import { Logger, LoggingServiceProvider, ServiceContainer } from '@itonics/core';
import { InvocationEventHandler, Lambda, LambdaConfig } from '@itonics/lambda';
import { SQSEvent } from 'aws-lambda';
import { config, onBoot, onInvocation, onShutdown, NotificationConverterConfig } from '../../common/config/config';
import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { CommonServiceProviders } from '../../common/providers/CommonServiceProviders';
import { NotificationDispatcherProvider } from '../providers/NotificationDispatcherProvider';
import { DispatcherService } from '../services/DispatcherService';

/**
 * Lambda to send email
 * Receives SQS messages sent by notification-aggregator lambda
 */
export const lambdaConfig: LambdaConfig<NotificationConverterConfig> = {
  serviceProviders: [new CommonServiceProviders(), new NotificationDispatcherProvider(), new LoggingServiceProvider()],
  eventHandlers: [
    new InvocationEventHandler((container: ServiceContainer) => {
      const logger: Logger = container.get(Logger);
      const emailDispatcherService = container.get(DispatcherService);


      return async (event: SQSEvent) => {
        logger.info('Inside Email Dispatcher Lambda');
        const notifications: Array<UserPreferences> = event.Records.map((record) => {
          return JSON.parse(record.body);
        }).reduce((x, y) => x.concat(y), []);
        logger.info('event::', notifications);
        await emailDispatcherService.dispatch(notifications);
      };
    })
  ],
  config,
  onBoot,
  onInvocation,
  onShutdown
};

export const handler = new Lambda(lambdaConfig).handlerFunction;
