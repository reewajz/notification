import { ConsoleLogger } from '@itonics/core';
import { DynamoDbServiceTest } from '../../../common/__tests__/DynamoDbServiceTest';
import {
  GeneralNotificationUpdateCommand,
  NotificationChannel,
  NotificationLevel,
  SystemWideNotificationUpdateCommand
} from '../../services/NotificationUpdateModel';
import { DynamoDbNotificationControlServiceImpl } from '../../services/impl/DynamoDbNotificationControlServiceImpl';

describe('NotificationControlService test', function() {

  const client = new DynamoDbServiceTest();
  const service = new DynamoDbNotificationControlServiceImpl(new ConsoleLogger(), client);

  jest.setTimeout(8000);

  beforeEach(async () => {
    try {
      await client.deleteTable(DynamoDbNotificationControlServiceImpl.TABLE);
    } catch (e) {
    } finally {
      await client.createTable(DynamoDbNotificationControlServiceImpl.TABLE, {
        partitionKeyName: 'identifier',
        partitionKeyType: 'S'
      });
    }
  });

  const Uris = {
    space: 'spaceUri',
    tenant: 'tenantUri',
    user: 'userUri'
  };


  it('should return notification enabled if it doesnt exist in table', async function() {
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(true);
  });

  it('should remove notification config from db when disabled/enabled notification ', async function() {
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(true);

    await service.disableNotificationFor(
      new GeneralNotificationUpdateCommand(Uris.space, NotificationChannel.Email, NotificationLevel.Space));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(false);

    await service.disableNotificationFor(
      new GeneralNotificationUpdateCommand(Uris.tenant, NotificationChannel.Email, NotificationLevel.Tenant));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(false);

    await service.disableNotificationFor(
      new GeneralNotificationUpdateCommand(Uris.user, NotificationChannel.Email, NotificationLevel.User));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(false);

    //
    // re-enable one by one
    await service
      .enableNotificationFor(new GeneralNotificationUpdateCommand(Uris.space, NotificationChannel.Email, NotificationLevel.Space));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(false);

    await service.enableNotificationFor(
      new GeneralNotificationUpdateCommand(Uris.tenant, NotificationChannel.Email, NotificationLevel.Tenant));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(false);

    await service.enableNotificationFor(
      new GeneralNotificationUpdateCommand(Uris.user, NotificationChannel.Email, NotificationLevel.User));

    // everything is enabled
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(true);
  });

  it('should disable for everybody if disabled in whole system', async function() {
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(true);

    // disable email for whole system
    await service.disableNotificationFor(new SystemWideNotificationUpdateCommand(NotificationChannel.Email));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(false);

    // should not be disabled for other than email
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Slack))
      .resolves.toStrictEqual(true);

    // enable for whole system
    await service.enableNotificationFor(new SystemWideNotificationUpdateCommand(NotificationChannel.Email));
    await expect(service.isNotificationEnabledFor(Uris.tenant, Uris.space, Uris.user, NotificationChannel.Email))
      .resolves.toStrictEqual(true);
  });
});

