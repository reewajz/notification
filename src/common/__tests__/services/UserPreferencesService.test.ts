import { ServiceContainer } from '@itonics/core';
import { createContainer, createData, deleteAllRecords, initAndCloseConnection } from '../../../notification-converter/__tests__/utils';
import { NotificationStatus } from '../../../notification-converter/interfaces/NotificationBuffer';
import { NotificationBufferService } from '../../../notification-converter/services/NotificationBufferService';
import { UserPreferences } from '../../interfaces/UserPreferences';
import { UserPreferencesService } from '../../services/UserPreferencesService';

describe('User Preferences Service', () => {
  let serviceContainer: ServiceContainer;
  let notificationBufferService: NotificationBufferService;
  let userPreferencesService: UserPreferencesService;
  beforeAll(async () => {
    const connection = await initAndCloseConnection();
    serviceContainer = createContainer(connection);
    notificationBufferService = serviceContainer.get(NotificationBufferService);
    userPreferencesService = serviceContainer.get(UserPreferencesService);
    await createData(connection);
  });

  deleteAllRecords();

  it('should create user preferences', async () => {
    const userPreferences: UserPreferences = {
      uri: 'testUri',
      notificationChannel: 'email',
      language: 'en',
      excludeList: ['ELEMENT_CREATED']
    };
    const notificationRecipients = await userPreferencesService.create(userPreferences);
    expect(notificationRecipients).toBeDefined();

    const response = await userPreferencesService.get(userPreferences.uri);
    expect(response).toEqual({
      uri: 'testUri',
      notificationChannel: 'email',
      language: 'en',
      excludeList: ['ELEMENT_CREATED'],
      isNotificationEnable: true
    });
  });

  // skipped as we are not throwing error instead creating a new record if use does not exist
  it.skip('should throw error if user preference does not exists while updating', async () => {
    const userPreferences: UserPreferences = {
      uri: '11111',
      notificationChannel: 'email',
      language: 'en',
      excludeList: ['ELEMENT_CREATED']
    };
    await expect(userPreferencesService.update(userPreferences)).rejects.toThrowError(
      `User Preferences with user uri:: ${userPreferences.uri} you are trying to update does not exists`
    );
  });

  it('should update user preferences', async () => {
    const userPreferences: UserPreferences = {
      uri: 'uri121212',
      notificationChannel: 'email',
      language: 'en',
      excludeList: ['ELEMENT_CREATED'],
      isNotificationEnable: true
    };
    const notificationRecipients = await userPreferencesService.create(userPreferences);

    expect(notificationRecipients).toBeDefined();

    notificationRecipients.isNotificationEnable = false;
    await userPreferencesService.update(notificationRecipients);

    const response = await userPreferencesService.get(userPreferences.uri);
    expect(response.isNotificationEnable).toBe(false);
  });

  it('should create only one user preferences for a userUri', async () => {
    const recipient: UserPreferences = {
      uri: 'userUri123',
      notificationChannel: 'email',
      language: 'en',
      excludeList: ['ELEMENT_CREATED']
    };
    const notificationRecipients = await userPreferencesService.create(recipient);
    expect(notificationRecipients).toBeDefined();

    recipient.notificationChannel = 'slack';
    await userPreferencesService.create(recipient);

    const response = await userPreferencesService.get('userUri123');

    expect(response).toBeDefined();
    expect(response.notificationChannel).toBe('email');
  });

  it.skip('should get user preferences details by uri', async () => {});

  it('should get all notification recipients by status with all user details from user table', async () => {
    const notificationRecipients = await userPreferencesService.getAllByStatusGroupByRecipient(NotificationStatus.waitingForAggregation);
    expect(notificationRecipients).toBeDefined();
    expect(notificationRecipients.length).toBeGreaterThan(0);

    notificationRecipients.forEach((notificationRecipient) => {
      expect(notificationRecipient.notificationBuffer).toBeDefined();
      expect(notificationRecipient.firstName).toBeDefined();
      expect(notificationRecipient.lastName).toBeDefined();
      expect(notificationRecipient.email).toBeDefined();
      expect(notificationRecipient.excludeList).toBeDefined();
      expect(notificationRecipient.notificationBuffer.length).toBeGreaterThan(0);
      notificationRecipient.notificationBuffer.forEach((nb) => {
        expect(nb.status).toBe(NotificationStatus.waitingForAggregation);
      });
    });
  });
});
