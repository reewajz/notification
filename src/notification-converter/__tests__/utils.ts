import { RawEventDataSource, S3RawEventParams } from '@itonics/audit-client';
import { DynamoDbService } from '@itonics/aws';
import { ConsoleLogger, Logger, ServiceContainer, TestServiceProvider } from '@itonics/core';
import { FeatureFlagClient } from '@itonics/features';
import { getCurrentStage } from '@itonics/lambda/lib';
import { types } from 'pg';
import { createConnection, getConnection, getConnectionManager, getCustomRepository, Connection } from 'typeorm';
import { DynamoDbServiceTest } from '../../common/__tests__/DynamoDbServiceTest';
import { mock } from '../../common/__tests__/test-utils';
import { SqsService } from '../../common/aws/sqs/SqsService';
import { NotificationConverterConfig } from '../../common/config/config';
import { CommonServiceProviders } from '../../common/providers/CommonServiceProviders';
import { UserPreferencesRepository } from '../../common/repositories/UserPreferencesRepository';
import { UserPreferencesService } from '../../common/services/UserPreferencesService';
import { UserPreferencesServiceImpl } from '../../common/services/UserPreferencesServiceImpl';
import { Audience } from '../interfaces/Audience';
import { EventDataPath } from '../interfaces/EventDataPath';
import { NotificationBuffer, NotificationStatus } from '../interfaces/NotificationBuffer';
import { SourceType } from '../interfaces/NotificationCategories';
import { NotificationEventConfig } from '../interfaces/NotificationEventConfig';
import { NotificationConfig } from '../lambda/tokens';
import { NotificationBufferModel } from '../model/NotificationBufferModel';
import { UserPreferencesModel } from '../model/UserPreferencesModel';
import { NotificationConverterProvider } from '../providers/NotificationConverterProvider';
import { NotificationBufferRepository } from '../repositories/NotificationBufferRepository';
import { NotificationBufferService } from '../services/NotificationBufferService';
import { NotificationBufferServiceImpl } from '../services/NotificationBufferServiceImpl';
import { NotificationEventConfigService } from '../services/NotificationEventConfigService';
import { NotificationAggregator } from '../services/notification-aggregator/NotificationAggregator';
import { NotificationAggregatorImpl } from '../services/notification-aggregator/NotificationAggregatorImpl';
import { elementUpdatedAuditEvent } from './auditEvents';

export const dynamoDbService = new DynamoDbServiceTest();

export const rawEventDataSource: RawEventDataSource<S3RawEventParams> = mock<RawEventDataSource<S3RawEventParams>>();

rawEventDataSource.read = jest.fn().mockImplementation(() => {
  return Promise.resolve(elementUpdatedAuditEvent);
});

export const notificationEventConfigService: NotificationEventConfigService = mock<NotificationEventConfigService>();
export const sqsService: SqsService = mock<SqsService>();

const mockFeatureFlagClient: FeatureFlagClient = mock<FeatureFlagClient>();

mockFeatureFlagClient.isFeatureEnabledInTenant = jest.fn().mockImplementation(() => {
  return true;
});

notificationEventConfigService.get = jest.fn().mockImplementation(() => {
  return Promise.resolve(getElementUpdatedNotificationEventConfig());
});

export async function initAndCloseConnection(): Promise<Connection> {
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
  // uncomment on start to create schema and table
  // Object.assign(config.database, {synchronize: true, dropSchema: true});
  const connection: Connection = await createConnection(config.database);

  await connection.query('CREATE SCHEMA IF NOT EXISTS notification');

  afterAll(async () => {
    const connections = getConnectionManager();
    if (connections.get().isConnected) {
      await connections.get().close();
    }
  });

  return connection;
}

export function deleteAllRecords() {
  afterAll(async () => {
    await deleteAllDBRecords();
  });
}

export async function deleteAllDBRecords() {
  const connection = getConnection();
  await connection.query('delete from notification.notification_buffer');
  await connection.query('delete from notification.user_preferences');
  await connection.query('delete from notification.notification_buffer_user_preferences_user_preferences');
  await connection.query('delete from tenant.user');
  await connection.query('delete from permission.space_user');
}

const config: NotificationConverterConfig = {
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
  environment: 'test'
};

export const createContainer = (connection: Connection) => {
  return new ServiceContainer([
    new CommonServiceProviders(),
    new NotificationConverterProvider(),
    new TestServiceProvider([
      { provide: Logger, use: new ConsoleLogger() },
      { provide: DynamoDbService, use: dynamoDbService },
      { provide: RawEventDataSource, use: rawEventDataSource },
      {
        provide: NotificationConfig,
        use: config
      },
      { provide: NotificationEventConfigService, use: notificationEventConfigService },
      {
        provide: NotificationBufferService,
        use: NotificationBufferServiceImpl
      },
      {
        provide: NotificationBufferRepository,
        factory() {
          return getCustomRepository(NotificationBufferRepository, connection.name);
        }
      },
      {
        provide: UserPreferencesRepository,
        factory() {
          return getCustomRepository(UserPreferencesRepository, connection.name);
        }
      },
      { provide: UserPreferencesService, use: UserPreferencesServiceImpl },
      { provide: SqsService, use: sqsService },
      {
        provide: NotificationAggregator,
        use: NotificationAggregatorImpl
      },
      {provide: FeatureFlagClient, use: mockFeatureFlagClient }
    ])
  ]);
};

const elementVarsNUrl = {
  variables: {
    elementName: 'objectName',
    elementType: 'translations.itonics@elements-node/contracts/types/ElementType'
  },
  actionUrl: 'https://{{tenantSlug}}.itonics-{{currentStage}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}'
};

export function getElementUpdatedNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'ELEMENT_UPDATED',
    object: 'contexts.newState.itonics@elements-node/contracts/elements/Element.createdByUri',
    source: SourceType.ELEMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    audience: [Audience.owner],
    ...elementVarsNUrl
  };
  return notificationConfig;
}

export function getElementChildCreatedNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'ELEMENT_CHILD_CREATED',
    object: EventDataPath.USER_URI,
    source: SourceType.ELEMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    audience: [Audience.owner],
    ...elementVarsNUrl
  };
  return notificationConfig;
}

export function getElementRatedNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'ELEMENT_RATED',
    object: EventDataPath.USER_URI,
    source: SourceType.ELEMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    ...elementVarsNUrl,
    elementUriPath: 'objectUri',
    audience: [Audience.owner]
  };
  return notificationConfig;
}

export function getElementPhaseChangeNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'ELEMENT_PHASE_CHANGE',
    object: EventDataPath.USER_URI,
    source: SourceType.ELEMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    elementUriPath: 'objectUri',
    audience: [Audience.elementOwner],
    ...elementVarsNUrl
  };
  return notificationConfig;
}

export function getElementRejectNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'ELEMENT_REJECTED',
    object: EventDataPath.USER_URI,
    source: SourceType.ELEMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    elementUriPath: 'objectUri',
    audience: [Audience.elementOwner],
    ...elementVarsNUrl
  };
  return notificationConfig;
}

export function getElementRevivedNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'ELEMENT_REVIVED',
    object: EventDataPath.USER_URI,
    source: SourceType.ELEMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    elementUriPath: 'objectUri',
    audience: [Audience.elementOwner],
    ...elementVarsNUrl
  };
  return notificationConfig;
}

export function getCommentCreateNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'COMMENT_CREATED',
    source: SourceType.COMMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    object: 'contexts.newState.itonics@files-node/Models/interfaces/Comment.createdBy',
    actionUrl: 'https://{{tenantSlug}}.itonics-{{currentStage}}.io/explorer/{{spaceUri}}/detail/{{sourceUri}}',
    audience: [Audience.owner],
    variables: {
      content: 'contexts.newState.itonics@files-node/Models/interfaces/Comment.content'
    }
  };
  return notificationConfig;
}

export function getCommentReplyNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'COMMENT_REPLY',
    source: SourceType.COMMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    object: 'contexts.newState.itonics@files-node/Models/interfaces/Comment.createdBy',
    actionUrl: elementVarsNUrl.actionUrl,
    audience: [Audience.owner, Audience.specificUser],
    variables: {
      content: 'contexts.newState.itonics@files-node/Models/interfaces/Comment.content'
    }
  };
  return notificationConfig;
}

export function getCommentMentionNotificationEventConfig() {
  const notificationConfig: NotificationEventConfig = {
    uri: 'COMMENT_MENTION',
    source: SourceType.COMMENT,
    subject: EventDataPath.USER_URI,
    predicate: EventDataPath.SUB_ACTION,
    object: 'contexts.newState.itonics@files-node/Models/interfaces/CommentMention.createdBy',
    actionUrl: 'https://{{tenantSlug}}.itonics-{{currentStage}}.io/explorer/{{spaceUri}}/detail/{{elementUri}}',
    audience: [Audience.owner, Audience.specificUser],
    variables: {
      content: 'contexts.newState.itonics@files-node/Models/interfaces/CommentMention.content'
    }
  };
  return notificationConfig;
}

export const userUri = 'd168c75f-9179-41bc-a11f-e790e8d93eef';
export const createdUserUri = '8f3b3c9e-7129-4e24-8fd2-14889ca9d258';

export async function createData(connection: Connection): Promise<void> {
  const serviceContainer = createContainer(connection);
  const notificationBufferService = serviceContainer.get(NotificationBufferService);
  const userPreferencesService = serviceContainer.get(UserPreferencesService);
  const userPreferences = await userPreferencesService.create({
    uri: userUri,
    notificationChannel: 'email',
    language: 'en',
    excludeList: ['ELEMENT_CREATED'],
    isNotificationEnable: true
  });
  notificationBufferData.userPreferences = [userPreferences];
  await notificationBufferService.create(notificationBufferData);
  await notificationBufferService.create(notificationBufferData);

  await connection.query(
    'INSERT INTO tenant."user" ("userUri", "email", "firstName", "lastName", "version", "createdOn")' +
      'VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)',
    [userUri, 'reewaj@itonics.de', 'reewaj', 'shrestha', 1, 12, createdUserUri, 'test@itonics.de', 'john', 'don', 1, 12]
  );

  await connection.query(
    'INSERT INTO permission.space_user ("userUri", "spaceUri", "addedOn", "active")' + 'VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)',
    [userUri, 'space123', '1', 'true', createdUserUri, 'space123', '1', 'false']
  );
}

export const notificationBufferData: NotificationBuffer = {
  subject: 'test',
  predicate: 'ELEMENT_UPDATED',
  object: 'test',
  source: SourceType.ELEMENT,
  spaceUri: 'spaceUri123',
  tenantUri: 'tenantUri123',
  status: NotificationStatus.waitingForAggregation
};
