import { LoggingServiceProvider } from '@itonics/core';
import { ConfigServiceProvider, Lambda, LambdaConfig, SQSEventHandler } from '@itonics/lambda';
import { AppConfig } from '../../Contracts/AppConfig';
import { config, onBoot, onInvocation, onShutdown } from '../../config';
import { BounceHandlerServiceProvider } from '../Providers/BounceHandlerServiceProvider';
import { BounceEventListener } from '../Queue/Listeners/BounceEventListener';


/*
|--------------------------------------------------------------------------
| Configure the Application
|--------------------------------------------------------------------------
|
| This is the central place to register all EventHandlers, ServiceProviders,
| and to add configuration for the application itself. The `config` key is
| depending on the type passed as the generic.
|
*/
export const lambdaConfig: LambdaConfig<AppConfig> = {
    serviceProviders: [
        new LoggingServiceProvider(),
        new ConfigServiceProvider(config),
        new BounceHandlerServiceProvider()
    ],

    eventHandlers: [
        new SQSEventHandler([
            BounceEventListener
        ])
    ],

    config,
    onBoot,
    onInvocation,
    onShutdown,
};

export const handler = new Lambda(lambdaConfig).handlerFunction;
