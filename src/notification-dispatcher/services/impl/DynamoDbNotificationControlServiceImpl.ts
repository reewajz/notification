import { DynamoDbService } from '@itonics/aws';
import { InjectDependencies, Logger } from '@itonics/core';
import { NotificationControlService } from '../NotificationControlService';
import {
  buildIdentifier,
  NotificationChannel,
  NotificationDeactivateTableModel,
  NotificationLevel,
  NotificationUpdateCommand,
  QueryNotificationDeactivateStatusModel
} from '../NotificationUpdateModel';

@InjectDependencies
export class DynamoDbNotificationControlServiceImpl implements NotificationControlService {
  public static readonly TABLE: string = 'NotificationDisableRegistry';

  constructor(
    private readonly logger: Logger,
    private readonly dynamoDbService: DynamoDbService) {
  }

  async isNotificationEnabledFor(tenantUri: string, spaceUri: string, userUri: string, type: NotificationChannel): Promise<boolean> {
    const criteria: Array<QueryNotificationDeactivateStatusModel> = [
      // check if notification disabled for whole system
      {
        level: NotificationLevel.System,
        channel: type
      },
      {
        level: NotificationLevel.Space,
        uri: spaceUri,
        channel: type
      },
      {
        level: NotificationLevel.Tenant,
        uri: tenantUri,
        channel: type
      },
      {
        level: NotificationLevel.User,
        uri: userUri,
        channel: type
      }
    ];

    const queries = criteria.map((query) => buildIdentifier(query.uri, query.channel, query.level));
    const result: Array<NotificationDeactivateTableModel> = await this.dynamoDbService
      .batchGet(DynamoDbNotificationControlServiceImpl.TABLE, 'identifier', queries);
    this.logger.debug(`isNotificationEnabledFor criteria query`, { criteria, result });
    if (!result.length) { // none of the option is disabled
      return true;
    }
    return queries.every((query) => {
      const criteriaResult = result.find((res) => res.identifier === query);
      return !criteriaResult;
    });
  }

  async disableNotificationFor(command: NotificationUpdateCommand) {
    this.logger.debug(`disabling notification for`, command);
    await this.dynamoDbService.getDocumentClient().put({
      TableName: DynamoDbNotificationControlServiceImpl.TABLE,
      Item: command.model
    }).promise();
  }

  async enableNotificationFor(command: NotificationUpdateCommand) {
    this.logger.debug(`enabling notification for`, command);
    await this.dynamoDbService.getDocumentClient().delete({
      TableName: DynamoDbNotificationControlServiceImpl.TABLE,
      Key: {
        identifier: command.model.identifier
      }
    }).promise();
  }
}
