import { Logger, ServiceContainer } from '@itonics/core';
import { HasDatabaseConfig, HasGatewayConfig } from '@itonics/lambda';
import { HasEnvironmentConfig } from '@itonics/lambda/dist/src/Contracts/LambdaConfig';
import { getAwsSecret, getCurrentStage } from '@itonics/lambda/lib';
import { types } from 'pg';
import { createConnection, getConnection, getConnectionManager } from 'typeorm';
import { NotificationBufferModel } from '../../notification-converter/model/NotificationBufferModel';
import { UserPreferencesModel } from '../../notification-converter/model/UserPreferencesModel';

export interface HasS3Config {
  bucket: {
    name: string;
  };
}

export type NotificationConverterConfig = HasDatabaseConfig & HasS3Config & HasEnvironmentConfig & { domain: string };

export const config: NotificationConverterConfig = {
  database: {
    type: 'postgres',
    host: process.env.ITONICS_DB_HOST,
    username: process.env.ITONICS_DB_USER,
    password: process.env.ITONICS_DB_PASSWORD,
    database: process.env.ITONICS_DB_DATABASE,
    schema: 'notification',
    logging: false,
    entities: [UserPreferencesModel, NotificationBufferModel]
  },
  bucket: {
    name: process.env.AUDIT_BUCKET_NAME
  },
  domain: getCurrentStage() === 'production' ? 'itonics' : `itonics-${getCurrentStage()}`,
  environment: getCurrentStage()
};

export const onBoot = async (notificationConfig: NotificationConverterConfig, container: ServiceContainer) => {
  await container.get(Logger).initialize();
  // Fetch the database and stripe secrets from the AwsSecrets Manager if running on AWS
  if (getCurrentStage() !== 'dev') {
    const connectionOptions = await getAwsSecret(process.env.CORE_DB_CLIENT_SECRET);
    Object.assign(notificationConfig.database, connectionOptions);
  }

  // This is a workaround for pg-driver to work properly with BigInt values
  // it is only safe to use this workaround as long as value does not exceed 2^53-1
  types.setTypeParser(20, function (val: any) {
    if (val && val > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Value ${val} is too big to be parsed as a javascript number safely!`);
    }
    return parseInt(val, 10);
  });

  types.setTypeParser(1700, function (val: any) {
    return Number(val);
  });

  await createConnection(notificationConfig.database);
};

export const onShutdown = async () => {
  const connections = getConnectionManager();
  if (connections.get().isConnected) {
    await connections.get().close();
  }
};

export const onInvocation = async (notificationConfig: NotificationConverterConfig, container: ServiceContainer) => {
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
