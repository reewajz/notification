import { EventHandlerFunction, IncomingEvent, Lambda } from '@itonics/lambda';
import { lambdaConfig } from '../lambda/email-dispatcher';

let app: EventHandlerFunction<IncomingEvent>;
let lambda: Lambda<void>;

/*
|--------------------------------------------------------------------------
| Setup and Teardown
|--------------------------------------------------------------------------
*/

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

describe('Email dispatcher lambda ', () => {
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
