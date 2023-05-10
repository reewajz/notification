import { LoggingServiceProvider } from '@itonics/core';
import { ConfigServiceProvider, HasGatewayConfig, Lambda, LambdaConfig } from '@itonics/lambda';
import { GatewayEventHandler, GatewayServiceProvider } from '@itonics/lambda/http';
import { config, onBoot, onInvocation, onShutdown, NotificationConverterConfig } from '../../common/config/config';
import { CommonServiceProviders } from '../../common/providers/CommonServiceProviders';
import { UserPreferencesController } from '../controllers/UserPreferencesController';

export type NotificationConfigWithGateWayConfig = NotificationConverterConfig & HasGatewayConfig;

const apiConfig: NotificationConfigWithGateWayConfig = {
  routePrefix: 'notification',
  permissions: { tenant: [], space: [] },
  ...config
};

export const lambdaConfig: LambdaConfig<NotificationConfigWithGateWayConfig> = {
  serviceProviders: [new GatewayServiceProvider(), new LoggingServiceProvider(), new CommonServiceProviders()],
  eventHandlers: [new GatewayEventHandler([UserPreferencesController])],
  config: apiConfig,
  onBoot,
  onShutdown,
  onInvocation
};
lambdaConfig.serviceProviders.push(new ConfigServiceProvider(lambdaConfig.config));

export const handler = new Lambda(lambdaConfig).handlerFunction;
