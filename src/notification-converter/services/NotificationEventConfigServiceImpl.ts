import { DynamoDbService } from '@itonics/aws';
import { generateUri, InjectDependencies, Logger } from '@itonics/core';
import GetItemOutput = DocumentClient.GetItemOutput;
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { Results } from '../../common/interfaces/Results';
import { NotificationEventConfig } from '../interfaces/NotificationEventConfig';
import { NotificationEventConfigService } from './NotificationEventConfigService';

@InjectDependencies
export class NotificationEventConfigServiceImpl implements NotificationEventConfigService {
  private static TABLE = 'NotificationEventConfig';

  constructor(private readonly logger: Logger, private readonly dynamoDbService: DynamoDbService) {}

  public create(notificationEventConfig: NotificationEventConfig): Promise<NotificationEventConfig> {
    return this.insertIntoTable(notificationEventConfig);
  }

  public async get(uri: string, source: string): Promise<NotificationEventConfig> {
    const params = {
      TableName: this.getTableName(),
      Key: {
        uri,
        source
      }
    };
    const data: GetItemOutput = await this.dynamoDbService.getDocumentClient().get(params).promise();
    return data.Item as NotificationEventConfig;
  }

  public async delete(uri: string, source: string): Promise<void> {
    const params = {
      TableName: this.getTableName(),
      Key: {
        uri,
        source
      }
    };
    await this.dynamoDbService.getDocumentClient().delete(params).promise();
  }

  public async update(notificationEventConfig: NotificationEventConfig): Promise<NotificationEventConfig> {
    const existingNotificationEventConfig = await this.get(notificationEventConfig.uri, notificationEventConfig.source);
    if (typeof existingNotificationEventConfig !== 'undefined') {
      return this.insertIntoTable(notificationEventConfig);
    } else {
      const message = 'The Notification Event Config you are trying to update, does not exists';
      throw new Error(message);
    }
  }

  public search(notificationEventConfig: NotificationEventConfig): Promise<Results<NotificationEventConfig>> {
    // search criteria tobe decided?
    return Promise.resolve(undefined);
  }

  ////////////////////////////

  private getTableName(): string {
    return NotificationEventConfigServiceImpl.TABLE;
  }

  private async insertIntoTable(notificationEventConfig: NotificationEventConfig) {
    const item = this.processBeforeSave(notificationEventConfig);
    await this.dynamoDbService.put(this.getTableName(), item);
    return item;
  }

  private processBeforeSave(notificationEventConfig: NotificationEventConfig) {
    notificationEventConfig.uri = notificationEventConfig.uri || generateUri();
    notificationEventConfig.createdOn = notificationEventConfig.createdOn || Date.now();
    notificationEventConfig.updatedOn = notificationEventConfig.updatedOn || Date.now();
    return notificationEventConfig;
  }
}
