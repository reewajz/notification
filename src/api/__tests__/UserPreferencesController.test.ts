import { generateUri, TestServiceProvider } from '@itonics/core';
import { EventHandlerFunction, GatewayResponse, HasGatewayConfig, IncomingEvent, Lambda } from '@itonics/lambda';
import { triggerHttpRequest } from '@itonics/lambda/testing';
import { APIGatewayEvent } from 'aws-lambda';
import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { InMemoryUserPreferencesService } from '../../common/services/InMemoryUserPreferencesService';
import { UserPreferencesService } from '../../common/services/UserPreferencesService';
import { lambdaConfig } from '../lambda/notification-api';

/*
|--------------------------------------------------------------------------
| Test Subjects
|--------------------------------------------------------------------------
*/

let app: EventHandlerFunction<IncomingEvent>;
let lambda: Lambda<HasGatewayConfig>;
const API_PREFIX = '/notification/preferences';

/*
|--------------------------------------------------------------------------
| Helper Methods
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Setup and Teardown
|--------------------------------------------------------------------------
*/
lambdaConfig.serviceProviders.push(
  new TestServiceProvider([
    // Overwrite any services with mock classes here
    { provide: UserPreferencesService, use: InMemoryUserPreferencesService }
  ])
);

describe('Tests for Notification User Preferences', () => {
  beforeEach(async () => {
    lambda = new Lambda(lambdaConfig);
    app = await lambda.bootstrap();
  });

  afterEach(async () => {
    await lambda.shutdown();
  });

  it('should create new user preferences', async () => {
    const userPreferences: UserPreferences = generateMockUserPreferences();
    const createdUserPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath('/'),
      httpMethod: 'POST',
      body: JSON.stringify(userPreferences)
    });
    expect(createdUserPreferences.statusCode).toBe(200);
    const response = JSON.parse(createdUserPreferences.body);
    expect(response).toEqual(userPreferences);
  });

  it('should return error while creating empty user preferences', async () => {
    const userPreferences: UserPreferences = generateMockUserPreferences();
    delete userPreferences.uri;
    const createdUserPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath('/'),
      httpMethod: 'POST',
      body: JSON.stringify(userPreferences)
    });
    expect(createdUserPreferences.statusCode).toBe(422);
    const response = JSON.parse(createdUserPreferences.body);
    expect(response.message).toBe('uri should not be empty, uri must be a string');
  });

  it('should return user preferences', async () => {
    await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath('/'),
      httpMethod: 'POST',
      body: JSON.stringify(generateMockUserPreferences())
    });
    const path = `/${generateMockUserPreferences().uri}`;
    const response = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath(path),
      httpMethod: 'GET'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should throw error if user preferences does not exists', async () => {
    const path = '/mockURI';
    const response = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath(path),
      httpMethod: 'GET'
    });

    expect(response.statusCode).toBe(404);
    const result = JSON.parse(response.body);
    expect(result.message).toBe('User preferences data not found!');
  });

  it('should update user preferences', async () => {
    const createdUserPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath('/'),
      httpMethod: 'POST',
      body: JSON.stringify(generateMockUserPreferences())
    });
    const response = JSON.parse(createdUserPreferences.body);
    response.notificationChannel = 'slack';
    const updatedUserPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath('/'),
      httpMethod: 'PUT',
      body: JSON.stringify(response)
    });

    const updateResponse = JSON.parse(updatedUserPreferences.body);

    expect(updatedUserPreferences.statusCode).toBe(200);
    expect(updateResponse).toBeDefined();
    expect(updateResponse.notificationChannel).toBe('slack');
  });

  // skip until the delete functionality is added
  it.skip('should delete user preferences', async () => {
    const createdUserPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath('/'),
      httpMethod: 'POST',
      body: JSON.stringify(generateMockUserPreferences())
    });
    const response = JSON.parse(createdUserPreferences.body);
    const path = `/${response.uri}`;

    const userPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath(path),
      httpMethod: 'GET'
    });

    expect(userPreferences.statusCode).toBe(200);
    expect(userPreferences.body).toBeDefined();

    await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath(path),
      httpMethod: 'DELETE',
      body: JSON.stringify(response)
    });

    const getUserPreferences = await triggerHttpRequestWithAuthContext(app, {
      path: buildAPIPath(path),
      httpMethod: 'GET'
    });

    const deleteResponse = JSON.parse(getUserPreferences.body);
    expect(deleteResponse.message).toBe('User preferences data not found!');
  });

  const buildAPIPath = (path: string): string => {
    return `${API_PREFIX}${path}`;
  };
});

export function triggerHttpRequestWithAuthContext<PayloadType>(
  application: EventHandlerFunction<IncomingEvent>,
  params: Partial<APIGatewayEvent>
): Promise<GatewayResponse<PayloadType>> {
  {
    return triggerHttpRequest(application, params, { uri: 'admin', tenants: { itonics: { status: 'ACTIVE', actions: [] } } });
  }
}

function generateMockUserPreferences(): UserPreferences {
  return {
    uri: generateUri(),
    notificationChannel: 'email',
    language: 'en',
    isNotificationEnable: true
  };
}
