import { ServiceContainer } from '@itonics/core';
import { KeyValueMap } from '../../common/interfaces/KeyValueMap';
import { QueryUtils } from '../services/QueryUtils';
import { createContainer, initAndCloseConnection } from './utils';


// skipped as it is used for testing the query
describe.skip('QueryUtils', () => {
  let serviceContainer: ServiceContainer;
  beforeAll(async () => {
    const connection = await initAndCloseConnection();
    serviceContainer = createContainer(connection);
  });

  it('should return response for raw query', async () => {
    const res: KeyValueMap = await QueryUtils.queryTable(
      `select exists(select 1 from permission.space_user where "spaceUri" = $1 AND "userUri" = $2 AND active = true)`,
      ['space123', 'user123']
    );
    expect(res).toBeDefined();
    expect(res.exists).toBeDefined();
  });
});
