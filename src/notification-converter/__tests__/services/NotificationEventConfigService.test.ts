import { ConsoleLogger } from '@itonics/core';
import { EventDataPath } from '../../interfaces/EventDataPath';
import { NotificationEventConfig } from '../../interfaces/NotificationEventConfig';
import { NotificationEventConfigService } from '../../services/NotificationEventConfigService';
import { NotificationEventConfigServiceImpl } from '../../services/NotificationEventConfigServiceImpl';
import { dynamoDbService, getElementUpdatedNotificationEventConfig } from '../utils';

const tableName = 'NotificationEventConfig';

const notificationEventConfig: Array<NotificationEventConfig> = [];
const notificationEventConfigService: NotificationEventConfigService = new NotificationEventConfigServiceImpl(
  new ConsoleLogger(),
  dynamoDbService
);

describe('NotificationEventConfigService', () => {
  beforeAll(async () => {
    await createTableAndData(notificationEventConfig);
  });

  afterAll(async () => {
    await dynamoDbService.deleteTable(tableName);
  });

  it('should return notification event config', async () => {
    const result = await notificationEventConfigService.get(notificationEventConfig[0].uri, notificationEventConfig[0].source);
    expect(result).toEqual(notificationEventConfig[0]);
  });

  it('should update notification event config', async () => {
    const notificationConfig = await notificationEventConfigService.create(getElementUpdatedNotificationEventConfig());
    expect(notificationConfig.predicate).toEqual(EventDataPath.SUB_ACTION);

    notificationConfig.predicate = EventDataPath.SUB_ACTION;
    await notificationEventConfigService.update(notificationConfig);
    const result = await notificationEventConfigService.get(notificationConfig.uri, notificationConfig.source);
    expect(result.predicate).toEqual(EventDataPath.SUB_ACTION);
  });

  it('should delete notification event config', async () => {
    const notificationConfig = await notificationEventConfigService.create(getElementUpdatedNotificationEventConfig());

    await notificationEventConfigService.delete(notificationConfig.uri, notificationConfig.source);
    const result = await notificationEventConfigService.get(notificationConfig.uri, notificationConfig.source);
    expect(result).toBeUndefined();
  });
});

async function createTableAndData(configs: Array<NotificationEventConfig>): Promise<void> {
  // create table in local dynamo db
  await createTable();
  configs.push(await createNotificationEventConfig());
}

function createTable(): Promise<void> {
  return dynamoDbService.createTable(tableName, {
    partitionKeyName: 'uri',
    partitionKeyType: 'S',
    sortKeyName: 'source',
    sortKeyType: 'S'
  });
}

function createNotificationEventConfig() {
  return notificationEventConfigService.create(getElementUpdatedNotificationEventConfig());
}
