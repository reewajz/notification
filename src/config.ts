import { Logger, ServiceContainer } from '@itonics/core';
import { getAwsSecret, getCurrentStage } from '@itonics/lambda/lib';
import { createConnection, getConnection, getConnectionManager } from 'typeorm';
import { AppConfig } from './Contracts/AppConfig';

export const config: AppConfig = {
    environment: getCurrentStage(),

    database: {
        type: 'postgres',
        host: process.env.ITONICS_DB_HOST,
        username: process.env.ITONICS_DB_USER,
        password: process.env.ITONICS_DB_PASSWORD,
        database: process.env.ITONICS_DB_DATABASE,
        useAwsSecret: 'core_db_client',
        logging: false,
    },

    sqs: {
        receivingFrom: {
            bounce_handler_queue_name: process.env.SQS_BOUNCE_HANDLER_NAME,
        }
    },

    ses: {
        region: process.env.SES_REGION
    }
};

export const onBoot = async (appConfig: AppConfig, container: ServiceContainer) => {
    await container.get(Logger).initialize();
    // Fetch the database and stripe secrets from the AwsSecrets Manager if running on AWS
    if (appConfig.environment !== 'dev') {
        const connectionOptions = await getAwsSecret('core_db_client');
        Object.assign(appConfig.database, connectionOptions);
    }
    await createConnection(appConfig.database);
};

export const onShutdown = async (appConfig: AppConfig) => {
    const connections = getConnectionManager();
    if (connections.get().isConnected) {
        await connections.get().close();
    }
};

export const onInvocation = async (appConfig: AppConfig, container: ServiceContainer) => {
    const connection = getConnection();
    const driver = connection.driver as any;
    for (const client of driver.master._clients) {
        try {
            await client.query('SELECT 1');
        } catch (error) {
            container.get(Logger).info('Reconnecting to PG');
            await getConnection().driver.disconnect();
            await getConnection().driver.connect();
            break;
        }
    }
};


