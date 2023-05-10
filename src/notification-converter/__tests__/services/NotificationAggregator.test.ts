import { ServiceContainer } from '@itonics/core';
import { UserPreferences } from '../../../common/interfaces/UserPreferences';
import { UserPreferencesService } from '../../../common/services/UserPreferencesService';
import { NotificationStatus } from '../../interfaces/NotificationBuffer';
import { NotificationBufferService } from '../../services/NotificationBufferService';
import { NotificationAggregator } from '../../services/notification-aggregator/NotificationAggregator';
import {
  createdUserUri,
  createContainer,
  createData,
  deleteAllDBRecords,
  deleteAllRecords,
  initAndCloseConnection,
  notificationBufferData,
  sqsService,
  userUri
} from '../utils';

describe('NotificationAggregator', () => {
  let serviceContainer: ServiceContainer;
  let notificationBufferService: NotificationBufferService;
  let userPreferencesService: UserPreferencesService;

  const mockSendMessage = jest.fn().mockImplementation((url, body) => {
    return Promise.resolve();
  });

  sqsService.sendMessage = mockSendMessage;

  beforeAll(async () => {
    const connection = await initAndCloseConnection();
    await deleteAllDBRecords();
    serviceContainer = createContainer(connection);
    notificationBufferService = serviceContainer.get(NotificationBufferService);
    userPreferencesService = serviceContainer.get(UserPreferencesService);
    await createData(connection);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMessage.mockClear();
  });

  afterAll(async () => {
    await deleteAllDBRecords();
  });

  deleteAllRecords();

  it('should aggregate and send notification to queue', async () => {
    const userPreferences = await userPreferencesService.create({
      language: 'en',
      notificationChannel: 'email',
      isNotificationEnable: true
    });
    notificationBufferData.userPreferences = [userPreferences];
    const nb = await notificationBufferService.create(notificationBufferData);

    await serviceContainer.get(NotificationAggregator).aggregate();
    expect(sqsService.sendMessage).toHaveBeenCalledTimes(1);
    // fixme: uncomment after config added
    // expect(mockSendMessage.mock.calls[0][0]).toEqual('notification-aggregator');
    const sentNotifications = JSON.parse(mockSendMessage.mock.calls[0][1]) as Array<UserPreferences>;
    expect(sentNotifications.length).toEqual(1);

    const aggregatedNotification = sentNotifications[0];
    expect(aggregatedNotification.firstName).toBe('reewaj');
    expect(aggregatedNotification.lastName).toBe('shrestha');
    expect(aggregatedNotification.language).toBe(userPreferences.language);
    expect(aggregatedNotification.notificationChannel).toBe(userPreferences.notificationChannel);
    expect(aggregatedNotification.email).toBe('reewaj@itonics.de');

    delete notificationBufferData.userPreferences;
    expect(aggregatedNotification.notificationBuffer.length).toEqual(3);
    expect(aggregatedNotification.notificationBuffer[0].uri).toBeDefined();
    delete aggregatedNotification.notificationBuffer[0].uri;
    expect(aggregatedNotification.notificationBuffer[0]).toEqual({
      object: 'test',
      predicate: 'ELEMENT_UPDATED',
      source: 'ELEMENT',
      spaceUri: 'spaceUri123',
      status: 'waitingForAggregation',
      subject: 'test',
      tenantUri: 'tenantUri123',
      variables: null,
      actionUrl: null
    });
  });

  it('should update status of all the notification buffer after aggregation', async () => {
    await notificationBufferService.create(notificationBufferData);
    await notificationBufferService.create(notificationBufferData);

    await serviceContainer.get(NotificationAggregator).aggregate();
    const response = await userPreferencesService.getAllByStatusGroupByRecipient(NotificationStatus.waitingForAggregation);

    expect(response.length).toEqual(0);
  });

  it('should only get details of user with is active', async () => {
    await notificationBufferService.create(notificationBufferData);
    await notificationBufferService.create(notificationBufferData);

    // creating user which status is set to false
    const userPreferences = await userPreferencesService.create({
      uri: createdUserUri,
      notificationChannel: 'email',
      language: 'en',
      isNotificationEnable: true
    });

    notificationBufferData.userPreferences = [userPreferences];
    await notificationBufferService.create(notificationBufferData);

    await serviceContainer.get(NotificationAggregator).aggregate();
    const response = await userPreferencesService.getAllByStatusGroupByRecipient(NotificationStatus.aggregated);

    expect(response.length).toEqual(1);
    expect(response[0].uri).toBe(userUri);
  });
});
