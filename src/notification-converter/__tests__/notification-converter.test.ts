import { TestServiceProvider } from '@itonics/core';
import { EventHandlerFunction, IncomingEvent, Lambda } from '@itonics/lambda';
import { mock } from '../../common/__tests__/test-utils';
import { lambdaConfig } from '../lambda/notification-converter';
import { NotificationEventConverter } from '../services/NotificationEventConverter';

let app: EventHandlerFunction<IncomingEvent>;
let lambda: Lambda<void>;

/*
|--------------------------------------------------------------------------
| Setup and Teardown
|--------------------------------------------------------------------------
*/

const notificationEventConverter: NotificationEventConverter = mock<NotificationEventConverter>();
lambdaConfig.serviceProviders.push(
  new TestServiceProvider([
    {
      provide: NotificationEventConverter,
      use: notificationEventConverter
    }
  ])
);

beforeEach(async () => {
  lambda = new Lambda(lambdaConfig);
  app = await lambda.bootstrap();
});

afterEach(async () => {
  await lambda.shutdown();
});

/*
|--------------------------------------------------------------------------
| Test Cases
|--------------------------------------------------------------------------
*/

describe('Notification converter lambda ', () => {
  /**
   * Tests if the application is able to boot up in general.
   *
   * Expected behavior: There shouldn't be any exceptions thrown, and
   * the app instance should be defined.
   */
  it('starts and stops without errors', async () => {
    expect(app).toBeDefined();
  });
});
