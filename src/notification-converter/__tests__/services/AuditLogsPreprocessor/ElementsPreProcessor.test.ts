import { ConsoleLogger } from '@itonics/core';
import { mock } from '../../../../common/__tests__/test-utils';
import { Audience } from '../../../interfaces/Audience';
import { ElementsPreProcessor } from '../../../services/AuditLogsPreprocessor/ElementsPreProcessor';
import { NotificationEventConfigService } from '../../../services/NotificationEventConfigService';

jest.mock('../../../services/QueryUtils', () => ({
  QueryUtils: {
    queryTable: jest.fn().mockImplementation((query: string, parameters: Array<string>) => {
      return Promise.resolve({
        uri: 'RkpTt3mDjTX4ppa',
        tenant_uri: 'testUser123',
        field_type_uri: 'user',
        name: 'User search field',
        createdOn: Date.now(),
        updateOn: Date.now()
      });
    }),
    queryAll: jest.fn().mockImplementation((query: string, parameters: Array<string>) => {
      return Promise.resolve([]);
    })
  }
}));

describe('ElementsPreProcessor tests', function () {
  it('should set appropriate field values when processing Notif-User-Search-Field', async function () {
    const notificationEventConfigService = mock<NotificationEventConfigService>();
    notificationEventConfigService.get = jest.fn().mockImplementation(() => {
      return {};
    });
    const preprocessor = new ElementsPreProcessor(new ConsoleLogger(), notificationEventConfigService);
    const result = await preprocessor.process(
      {
        sourceUri: '6y2Gd90o5beUqZML',
        // @ts-ignore
        sourceType: 'SPACE',
        objectUri: 'iOKnULf84g5a3QA',
        objectName: 'notif',
        timestamp: 1664175206819,
        userUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
        type: 'itonics@elements-node/contracts/elements/Element',
        subAction: 'ELEMENT_UPDATED',
        // @ts-ignore
        action: 'UPDATE',
        contexts: {
          newState: {
            'itonics@elements-node/contracts/elements/Element': {
              uri: 'iOKnULf84g5a3QA',
              spaceUri: '6y2Gd90o5beUqZML',
              label: 'notif',
              elementTypeUri: 'wa1Wllbd9BJVx3V',
              summary: 'Summary prasant',
              primaryImage: null,
              status: 'published',
              createdOn: 1663652763829,
              updatedOn: 1664175206656,
              createdByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
              updatedByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e6',
              originType: 'SPACE',
              originUri: '6y2Gd90o5beUqZML',
              origin: 'Marius Space',
              creatorType: 'USER',
              updaterType: 'USER',
              version: 54,
              fieldValues: [
                {
                  value: ['88bcddf3-8c34-41ff-aca0-30bf45cea2d8'],
                  fieldUri: '149lviGg3XPCxKw'
                },
                {
                  value: [
                    'd168c75f-9179-41bc-a11f-e790e8d93eef',
                    'ab54be24-d255-4725-9391-f5794f453c24',
                    'd7e85cf3-eea1-4b1f-a8e4-9d38478237df',
                    '5b18c754-fb7f-44ac-8704-87e980a6a2e3'
                  ],
                  fieldUri: 'bnRDmWhL47IqpeA'
                },
                {
                  value: ['be86f124-ccb7-47cd-a22e-d9bfb1cbce3a'],
                  fieldUri: 'QLPKeTQKjvgjsQx'
                }
              ],
              tags: []
            }
          },
          oldState: {
            'itonics@elements-node/contracts/elements/Element': {
              uri: 'iOKnULf84g5a3QA',
              spaceUri: '6y2Gd90o5beUqZML',
              label: 'notif',
              elementTypeUri: 'wa1Wllbd9BJVx3V',
              summary: 'Summary prasant',
              primaryImage: null,
              status: 'published',
              createdOn: 1663652763829,
              updatedOn: 1664175206195,
              createdByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
              updatedByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e6',
              version: 54,
              fieldValues: [
                {
                  value: ['88bcddf3-8c34-41ff-aca0-30bf45cea2d8'],
                  fieldUri: '149lviGg3XPCxKw'
                },
                {
                  value: [
                    'd168c75f-9179-41bc-a11f-e790e8d93eef',
                    'ab54be24-d255-4725-9391-f5794f453c24',
                    'd7e85cf3-eea1-4b1f-a8e4-9d38478237df'
                  ],
                  fieldUri: 'bnRDmWhL47IqpeA'
                },
                {
                  value: ['be86f124-ccb7-47cd-a22e-d9bfb1cbce3a'],
                  fieldUri: 'QLPKeTQKjvgjsQx'
                }
              ],
              tags: [],
              creatorType: 'USER',
              originType: 'SPACE',
              originUri: '6y2Gd90o5beUqZML',
              updaterType: 'USER',
              origin: 'Marius Space'
            }
          }
        },
        translations: {
          SPACE: {
            '6y2Gd90o5beUqZML': 'Marius Space'
          },
          'itonics@elements-node/contracts/types/Field': {
            '149lviGg3XPCxKw': 'Campaign Manager',
            QLPKeTQKjvgjsQx: 'Kai User Field',
            bnRDmWhL47IqpeA: 'Notif-User-Search-Field'
          },
          'itonics@elements-node/contracts/types/ElementType': {
            wa1Wllbd9BJVx3V: 'Notif'
          },
          TENANT: {
            SQsAwJNMVieSscAq: 'Marius Organization'
          }
        },
        eventUri: 'Hb3gb0jwsRB6rbUqaIorbMRtXqKdC7WllcNxPMSk',
        // @ts-ignore
        status: 'ENRICHED',
        key: 'SPACE/6y2Gd90o5beUqZML/2022/9/26/1664175206857_ce0144ba-e559-4801-9c39-10fdf2648856'
      },
      'element'
    );
    expect(result.audience).toEqual([Audience.specificUser]);
    // this is the newly added user in the field
    expect(result.preFetchVariables.audiences).toEqual(['5b18c754-fb7f-44ac-8704-87e980a6a2e3']);
    expect(result.preFetchVariables.notificationType).toEqual('FieldValueChanges');
    expect(result.preFetchVariables.fieldName).toEqual('User search field');
  });

  it('should set appropriate field values when processing Campaign manager', async function () {
    const notificationEventConfigService = mock<NotificationEventConfigService>();
    notificationEventConfigService.get = jest.fn().mockImplementation(() => {
      return {};
    });
    const preprocessor = new ElementsPreProcessor(new ConsoleLogger(), notificationEventConfigService);
    const result = await preprocessor.process(
      {
        sourceUri: '6y2Gd90o5beUqZML',
        // @ts-ignore
        sourceType: 'SPACE',
        objectUri: 'iOKnULf84g5a3QA',
        objectName: 'notif',
        timestamp: 1664176521501,
        userUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
        type: 'itonics@elements-node/contracts/elements/Element',
        subAction: 'ELEMENT_UPDATED',
        // @ts-ignore=
        action: 'UPDATE',
        contexts: {
          newState: {
            'itonics@elements-node/contracts/elements/Element': {
              uri: 'iOKnULf84g5a3QA',
              spaceUri: '6y2Gd90o5beUqZML',
              label: 'notif',
              elementTypeUri: 'wa1Wllbd9BJVx3V',
              summary: 'Summary prasant',
              primaryImage: null,
              status: 'published',
              createdOn: 1663652763829,
              updatedOn: 1664176521281,
              createdByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
              updatedByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e6',
              originType: 'SPACE',
              originUri: '6y2Gd90o5beUqZML',
              origin: 'Marius Space',
              creatorType: 'USER',
              updaterType: 'USER',
              version: 57,
              fieldValues: [
                {
                  value: [
                    '88bcddf3-8c34-41ff-aca0-30bf45cea2d8',
                    '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
                    'd168c75f-9179-41bc-a11f-e790e8d93eef'
                  ],
                  fieldUri: '149lviGg3XPCxKw'
                },
                {
                  value: [
                    'd168c75f-9179-41bc-a11f-e790e8d93eef',
                    'ab54be24-d255-4725-9391-f5794f453c24',
                    'd7e85cf3-eea1-4b1f-a8e4-9d38478237df'
                  ],
                  fieldUri: 'bnRDmWhL47IqpeA'
                },
                {
                  value: ['be86f124-ccb7-47cd-a22e-d9bfb1cbce3a'],
                  fieldUri: 'QLPKeTQKjvgjsQx'
                }
              ],
              tags: []
            }
          },
          oldState: {
            'itonics@elements-node/contracts/elements/Element': {
              uri: 'iOKnULf84g5a3QA',
              spaceUri: '6y2Gd90o5beUqZML',
              label: 'notif',
              elementTypeUri: 'wa1Wllbd9BJVx3V',
              summary: 'Summary prasant',
              primaryImage: null,
              status: 'published',
              createdOn: 1663652763829,
              updatedOn: 1664176444648,
              createdByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
              updatedByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e6',
              version: 56,
              fieldValues: [
                {
                  value: [
                    '88bcddf3-8c34-41ff-aca0-30bf45cea2d8',
                    '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
                    'Ab18c754-fb7f-44ac-8704-87e980a6a2e3'
                  ],
                  fieldUri: '149lviGg3XPCxKw'
                },
                {
                  value: [
                    'd168c75f-9179-41bc-a11f-e790e8d93eef',
                    'ab54be24-d255-4725-9391-f5794f453c24',
                    'd7e85cf3-eea1-4b1f-a8e4-9d38478237df'
                  ],
                  fieldUri: 'bnRDmWhL47IqpeA'
                },
                {
                  value: ['be86f124-ccb7-47cd-a22e-d9bfb1cbce3a'],
                  fieldUri: 'QLPKeTQKjvgjsQx'
                }
              ],
              tags: [],
              creatorType: 'USER',
              originType: 'SPACE',
              originUri: '6y2Gd90o5beUqZML',
              updaterType: 'USER',
              origin: 'Marius Space'
            }
          }
        },
        translations: {
          SPACE: {
            '6y2Gd90o5beUqZML': 'Marius Space'
          },
          'itonics@elements-node/contracts/types/Field': {
            '149lviGg3XPCxKw': 'Campaign Manager',
            QLPKeTQKjvgjsQx: 'Kai User Field',
            bnRDmWhL47IqpeA: 'Notif-User-Search-Field'
          },
          'itonics@elements-node/contracts/types/ElementType': {
            wa1Wllbd9BJVx3V: 'Notif'
          },
          TENANT: {
            SQsAwJNMVieSscAq: 'Marius Organization'
          }
        },
        eventUri: 'lqHqQ2XHfff40K3FaL1VJWPJADwQAOrM0MEyP23e',
        // @ts-ignore=
        status: 'ENRICHED',
        key: 'SPACE/6y2Gd90o5beUqZML/2022/9/26/1664176521549_6b59e1c0-efb8-407f-b88e-42335f3c1405'
      },
      'element'
    );
    expect(result.audience).toEqual([Audience.specificUser]);
    // this is the newly added user in the field Campaign Manager
    expect(result.preFetchVariables.audiences).toEqual(['d168c75f-9179-41bc-a11f-e790e8d93eef']);
    expect(result.preFetchVariables.notificationType).toEqual('FieldValueChanges');
    expect(result.preFetchVariables.fieldName).toEqual('User search field');
  });

});
