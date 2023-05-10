import { HasDatabaseConfig } from '@itonics/lambda';
import { HasEnvironmentConfig } from '@itonics/lambda';

/**
 * Specifies the configuration keys needed to retrieve and dispatch SQS messages.
 */
export interface HasSQSConfig {
    sqs: {
        receivingFrom: {
            bounce_handler_queue_name: string;
        };
    };
}

/**
 * AWS configuration options
 */
export interface HasSESConfig {
    ses: {
        region: string;
    };
}

/**
 * Exports the composition of various configuration interfaces
 * as a single application-wide configuration type.
 */
export type AppConfig = HasEnvironmentConfig
    & HasSQSConfig
    & HasDatabaseConfig
    & HasSESConfig;
