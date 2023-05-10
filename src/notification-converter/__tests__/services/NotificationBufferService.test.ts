import { ServiceContainer } from '@itonics/core';
import { UserPreferencesService } from '../../../common/services/UserPreferencesService';
import { NotificationBuffer, NotificationStatus } from '../../interfaces/NotificationBuffer';
import { NotificationBufferService } from '../../services/NotificationBufferService';
import { createContainer, deleteAllDBRecords, initAndCloseConnection, notificationBufferData } from '../utils';

describe('Notification Buffer Service', () => {
  let serviceContainer: ServiceContainer;
  let notificationBufferService: NotificationBufferService;
  let userPreferencesService: UserPreferencesService;
  beforeAll(async () => {
    const connection = await initAndCloseConnection();
    serviceContainer = createContainer(connection);
    notificationBufferService = serviceContainer.get(NotificationBufferService);
    userPreferencesService = serviceContainer.get(UserPreferencesService);
    await createData();
  });

  afterAll(async () => {
    await deleteAllDBRecords();
  });

  it('should create notification buffer', async () => {
    const response = await notificationBufferService.create(notificationBufferData);
    expect(response).toBeDefined();
    expect(response).toMatchObject(notificationBufferData);
  });

  it('should get notification buffer using uri', async () => {
    const savedNotificationBuffer = await notificationBufferService.create(notificationBufferData);
    const notificationBuffer = await notificationBufferService.get(savedNotificationBuffer.uri);

    expect(savedNotificationBuffer).toEqual(removeNullValues(notificationBuffer));
  });

  it('should delete notification buffer', async () => {
    const savedNotificationBuffer = await notificationBufferService.create(notificationBufferData);
    expect(savedNotificationBuffer).toBeDefined();

    const notificationBuffer = await notificationBufferService.delete(savedNotificationBuffer.uri);
    expect(notificationBuffer).toBeUndefined();
  });

  it('should get all notification buffer', async () => {
    const notificationBuffer = await notificationBufferService.getAll();

    expect(notificationBuffer).toBeDefined();
    expect(notificationBuffer.length).toBeGreaterThan(0);
  });

  // it('should get only distinct notification buffer', async () => {
  //   const notificationBuffer = await notificationBufferService.getAll();
  //   expect(notificationBuffer.length).toBeGreaterThan(1);
  // });

  it('should bulk update status', async () => {
    const nb1 = await notificationBufferService.create(Object.assign(notificationBufferData, { status: NotificationStatus.aggregated }));
    const nb2 = await notificationBufferService.create(Object.assign(notificationBufferData, { status: NotificationStatus.aggregated }));
    const nb3 = await notificationBufferService.create(Object.assign(notificationBufferData, { status: NotificationStatus.aggregated }));

    await notificationBufferService.bulkUpdateStatus(NotificationStatus.dispatched, NotificationStatus.aggregated);
    const notificationBuffer1 = await notificationBufferService.get(nb1.uri);
    const notificationBuffer2 = await notificationBufferService.get(nb2.uri);
    const notificationBuffer3 = await notificationBufferService.get(nb3.uri);
    await validateNotificationStatus([notificationBuffer1.uri, notificationBuffer2.uri, notificationBuffer3.uri]);
  });

  async function validateNotificationStatus(uris: Array<string>) {
    for (let i = 0; i < uris.length; i++) {
      const nb = await getByUri(uris[i]);
      expect(nb.status).toBe(NotificationStatus.dispatched);
    }
  }

  function getByUri(uri: string): Promise<NotificationBuffer> {
    return notificationBufferService.get(uri);
  }

  async function createData(): Promise<void> {
    const userPreferences = await userPreferencesService.create({
      language: 'en',
      notificationChannel: 'email',
      excludeList: []
    });
    notificationBufferData.userPreferences = [userPreferences];
    await notificationBufferService.create(notificationBufferData);
    await notificationBufferService.create(notificationBufferData);
  }
});

function removeNullValues(nb: NotificationBuffer) {
  Object.keys(nb).forEach((key: keyof NotificationBuffer) => {
    if (nb[key] === null) {
      delete nb[key];
    }
  });
  return nb;
}
