import { ActionType, AuditEventBase, EventStatus, SourceType } from '@itonics/audit-client';
import { ServiceContainer } from '@itonics/core';
import { UserPreferencesService } from '../../../common/services/UserPreferencesService';
import { InCorrectPathException } from '../../../common/utils/exceptions/InCorrectPathException';
import { NotificationBuffer } from '../../interfaces/NotificationBuffer';
import { NotificationBufferService } from '../../services/NotificationBufferService';
import { NotificationEventConverter } from '../../services/NotificationEventConverter';
import {
  commentCreateAuditEvent,
  commentMentionAuditEvent,
  commentReplyAuditEvent,
  commentReplyWithUserAndElementMention,
  elementParentChild,
  elementPhaseChangeAuditEvent,
  elementRatedAuditEvent,
  elementRejectAuditEvent,
  elementReviveAuditEvent,
  elementUpdatedAuditEvent,
  elementUpdateWithChildInfo
} from '../auditEvents';
import {
  createContainer,
  getCommentCreateNotificationEventConfig,
  getCommentMentionNotificationEventConfig,
  getCommentReplyNotificationEventConfig,
  getElementChildCreatedNotificationEventConfig,
  getElementPhaseChangeNotificationEventConfig,
  getElementRatedNotificationEventConfig,
  getElementRejectNotificationEventConfig,
  getElementRevivedNotificationEventConfig,
  getElementUpdatedNotificationEventConfig,
  initAndCloseConnection,
  notificationEventConfigService,
  rawEventDataSource
} from '../utils';

const userUri = 'd168c75f-9179-41bc-a11f-e790e8d93eef';

const entityCreatedByUri = 'entityCreateUri123';

jest.mock('../../services/QueryUtils', () => ({
  QueryUtils: {
    // tslint:disable-next-line:cyclomatic-complexity
    queryTable: jest.fn().mockImplementation((query: string, parameters: Array<string>) => {
      if (query.includes('tenant.user')) {
        return Promise.resolve({
          userUri: parameters[0],
          email: 'reewaj.com',
          firstName: 'reewaj',
          lastName: 'shrestha',
          version: 1,
          createdOn: Date.now()
        });
      }

      if (query.includes('entity.entity')) {
        return Promise.resolve({
          uri: 'uri123',
          createdByUri: entityCreatedByUri,
          label: 'entityName',
          spaceUri: 'space123',
          summary: 'entity summary',
          typeUri: 'typeUri123',
          status: 'published',
          name: 'Trend',
          createdOn: Date.now()
        });
      }

      if (query.includes('social.comments')) {
        return Promise.resolve({
          tenant_uri: 'uri123',
          created_by: 'testUser123',
          comment_uri: 'commentUri123',
          status: 'published',
          content:
            '{"ops":[{"insert":{"mention":{"denotationChar":"@","id":"5b18c754-fb7f-44ac-8704-87e980a6a2e3","value":""}}},{"insert":" whats up?\\n"}]}',
          createdOn: Date.now()
        });
      }

      if (query.includes('elements.fields')) {
        return Promise.resolve({
          uri: 'RkpTt3mDjTX4ppa',
          tenant_uri: 'testUser123',
          field_type_uri: 'workflowStatus',
          name: 'Workflow Status',
          createdOn: Date.now(),
          updateOn: Date.now()
        });
      }

      if (query.includes('select "userUri", "firstName", "lastName", "email" from tenant.user where "userUri" = ANY ')) {
        return [
          {
            userUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
            firstName: 'Reewaj',
            lastName: 'Shrestha',
            email: 'reewaj.shrestha@itonics.de'
          },
          {
            userUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
            firstName: 'Prashant',
            lastName: 'Barahi',
            email: 'prashant.barahi@itonics.de'
          }
        ];
      }

      if (query.includes('select exists (select 1 from permission')) {
        return Promise.resolve({
          exists: true
        });
      }

      return Promise.resolve({
        tenantUri: 'dkk8PGJiTfqFpUEO',
        tenantName: 'test',
        tenantSlug: 'reewaj-test',
        createdDate: Date.now()
      });
    }),
    queryAll: jest.fn().mockImplementation((query: string, parameters: Array<string>) => {
      if (query.includes('tenant.user')) {
        return [
          {
            userUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
            firstName: 'Reewaj',
            lastName: 'Shrestha',
            email: 'reewaj.shrestha@itonics.de'
          },
          {
            userUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
            firstName: 'Prashant',
            lastName: 'Barahi',
            email: 'prashant.barahi@itonics.de'
          }
        ];
      }

      if (query.includes('entity.entity where uri = ANY')) {
        return Promise.resolve([
          {
            uri: 'EQ1hDMWarWsrsZV',
            createdByUri: entityCreatedByUri,
            label: 'Caraxes',
            spaceUri: 'space123',
            summary: 'entity summary',
            typeUri: 'typeUri123',
            status: 'published',
            createdOn: Date.now()
          }
        ]);
      }

      return Promise.resolve([]);
    })
  }
}));

describe('NotificationEventConverter', () => {
  let serviceContainer: ServiceContainer;
  beforeAll(async () => {
    const connection = await initAndCloseConnection();
    serviceContainer = createContainer(connection);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should convert audit event', async () => {
    const notificationBuffer = await transform();
    expect(notificationBuffer).toBeDefined();
    expect(notificationBuffer.userPreferences).toBeDefined();
  });

  it('should fetch extra details from s3', async () => {
    await transform();
    const params = {
      bucket: 'testBucket',
      key: getAuditEventBase().key
    };
    expect(rawEventDataSource.read).toHaveBeenCalledTimes(1);
    expect(rawEventDataSource.read).toHaveBeenLastCalledWith(params);
  });

  it('should pre process for specific condition', async () => {
    await transform();
    expect(notificationEventConfigService.get).toHaveBeenCalledTimes(1);
    expect(notificationEventConfigService.get).toHaveBeenCalledWith('ELEMENT_ARCHIVED', 'ELEMENT');
  });

  it('should convert audit event for element rate', async () => {
    rawEventDataSource.read = jest.fn().mockImplementation(() => {
      return Promise.resolve(elementRatedAuditEvent);
    });

    notificationEventConfigService.get = jest.fn().mockImplementation(() => {
      return Promise.resolve(getElementRatedNotificationEventConfig());
    });
    const notificationBuffer = await transform();
    expect(notificationBuffer).toBeDefined();
    expect(notificationBuffer.userPreferences).toBeDefined();
    expect(notificationBuffer.predicate).toBe('ELEMENT_RATED');
    expect(notificationBuffer.subject).toBe(elementRatedAuditEvent.userUri);
    expect(notificationBuffer.variables).toBeDefined();
    expect(notificationBuffer.variables).toBeDefined();
    validateElementNotificationBufferVariables(notificationBuffer);
  });

  it('should generate actionUrl', async () => {
    rawEventDataSource.read = jest.fn().mockImplementation(() => {
      return Promise.resolve(elementUpdatedAuditEvent);
    });

    notificationEventConfigService.get = jest.fn().mockImplementation(() => {
      return Promise.resolve(getElementUpdatedNotificationEventConfig());
    });

    await transform();

    const notificationBuffers = await serviceContainer
      .get(NotificationBufferService)
      .query('select * from notification.notification_buffer where predicate = $1', ['ELEMENT_UPDATED']);

    expect(notificationBuffers.length).toBeGreaterThan(0);
    notificationBuffers.forEach((notificationBuffer) => {
      expect(notificationBuffer.actionUrl).toBeDefined();
      expect(notificationBuffer.actionUrl).toBe('https://reewaj-test.itonics-test.io/explorer/ltBURmSps2Us70f7/detail/nk24XhNOvyEq33h');
    });
  });

  it('should get user details from audit event', async () => {
    const notificationBuffer = await transform();
    const variables = notificationBuffer.variables;
    expect(variables.user).toBeDefined();
    expect(Object.keys(variables.user)).toEqual(expect.arrayContaining(['firstName', 'lastName']));
  });

  it('should generate audience', async () => {
    const userPreferencesService = serviceContainer.get(UserPreferencesService);
    const userPreferencesServiceSpy = jest.spyOn(userPreferencesService, 'create');
    const notificationBuffer = await transform();
    delete notificationBuffer.uri;
    delete notificationBuffer.createdOn;

    expect(userPreferencesServiceSpy).toHaveBeenCalledTimes(1);
    expect(userPreferencesServiceSpy).toHaveBeenCalledWith({
      isNotificationEnable: true,
      language: 'en',
      notificationChannel: 'email',
      uri: '8f3b3c9e-7129-4e24-8fd2-14889ca9d258'
    });
  });

  it('should save notification to buffer with all user configuration', async () => {});

  it('should save the event to notification buffer and user preference table', async () => {
    const notificationBufferService = serviceContainer.get(NotificationBufferService);
    const userPreferencesService = serviceContainer.get(UserPreferencesService);
    const notificationBufferServiceSpy = jest.spyOn(notificationBufferService, 'create');
    const userPreferencesServiceSpy = jest.spyOn(userPreferencesService, 'create');
    const notificationBuffer = await transform();
    delete notificationBuffer.uri;
    delete notificationBuffer.createdOn;

    expect(notificationBufferServiceSpy).toHaveBeenCalledTimes(1);
    expect(notificationBufferServiceSpy).toHaveBeenCalledWith(notificationBuffer);
    expect(userPreferencesServiceSpy).toHaveBeenCalledTimes(1);
    expect(userPreferencesServiceSpy).toHaveBeenCalledWith({
      isNotificationEnable: true,
      language: 'en',
      notificationChannel: 'email',
      uri: '8f3b3c9e-7129-4e24-8fd2-14889ca9d258'
    });
  });

  it('should throw error is specified path for config is incorrect', async () => {
    rawEventDataSource.read = jest.fn().mockImplementation(() => {
      return Promise.resolve(elementUpdatedAuditEvent);
    });

    notificationEventConfigService.get = jest.fn().mockImplementation(() => {
      const config = getElementUpdatedNotificationEventConfig();
      config.object = 'contexts.state.itonics@elements-node/contracts/elements/Element.createdByUri';
      return Promise.resolve(config);
    });

    await expect(serviceContainer.get(NotificationEventConverter).transform(getAuditEventBase())).rejects.toThrowError(
      InCorrectPathException
    );
  });

  describe('Elements Ideation', () => {
    it('should convert audit event for element phase change', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(elementPhaseChangeAuditEvent);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getElementPhaseChangeNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('ELEMENT_PHASE_CHANGE');
      expect(notificationBuffer.subject).toBe(elementPhaseChangeAuditEvent.userUri);
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.variables).toBeDefined();
      validateElementNotificationBufferVariables(notificationBuffer);
      expect(notificationBuffer.variables.phases).toBeDefined();
      expect(notificationBuffer.variables.phases.from).toBe('Concept Development');
      expect(notificationBuffer.variables.phases.to).toBe('Implementation');
    });

    it('should convert audit event for element reject', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(elementRejectAuditEvent);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getElementRejectNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('ELEMENT_REJECTED');
      expect(notificationBuffer.subject).toBe(elementPhaseChangeAuditEvent.userUri);
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.variables).toBeDefined();
      validateElementNotificationBufferVariables(notificationBuffer);
    });

    it('should convert audit event for element reviewed', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(elementReviveAuditEvent);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getElementRevivedNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('ELEMENT_REVIVED');
      expect(notificationBuffer.subject).toBe(elementPhaseChangeAuditEvent.userUri);
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.variables).toBeDefined();
      validateElementNotificationBufferVariables(notificationBuffer);
    });

    it('should send notification to owner of parent element', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(elementParentChild);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getElementChildCreatedNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('ELEMENT_CHILD_CREATED');
      expect(notificationBuffer.subject).toBe(elementPhaseChangeAuditEvent.userUri);
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.userPreferences[0].uri).toBe(entityCreatedByUri);
      validateElementNotificationBufferVariables(notificationBuffer);

      expect(notificationBuffer.variables.parentElement).toBeDefined();
      expect(notificationBuffer.variables.parentElement.title).toBe('entityName');
      expect(notificationBuffer.variables.parentElement.type).toBe('Trend');
    });

    it('should send notification to owner of parent element with update event', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(elementUpdateWithChildInfo);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getElementChildCreatedNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('ELEMENT_CHILD_CREATED');
      expect(notificationBuffer.subject).toBe('d168c75f-9179-41bc-a11f-e790e8d93eef');
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.variables).toBeDefined();
      expect(notificationBuffer.userPreferences[0].uri).toBe(entityCreatedByUri);
      validateElementNotificationBufferVariables(notificationBuffer);

      expect(notificationBuffer.variables.parentElement).toBeDefined();
      expect(notificationBuffer.variables.parentElement.title).toBe('entityName');
      expect(notificationBuffer.variables.parentElement.type).toBe('Trend');
    });
  });

  describe('Comment Notification Converter', () => {
    it('should convert audit event for comment on his/her element ', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(commentCreateAuditEvent);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getCommentCreateNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('COMMENT_CREATED');
      expect(notificationBuffer.subject).toBe(commentCreateAuditEvent.userUri);
      expect(notificationBuffer.object).toBe(
        commentCreateAuditEvent.contexts.newState['itonics@files-node/Models/interfaces/Comment'].createdBy
      );
      validateCommentNotificationBufferVariables(notificationBuffer);
    });

    it('should not create notification buffer if commented by same element owner', async () => {});

    it('should convert audit event for comment reply', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(commentReplyAuditEvent);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getCommentReplyNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      // const notificationBuffer = await serviceContainer.get(NotificationBufferService).get();
      // const userPreferences = await serviceContainer.get(RecipientService).get();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('COMMENT_REPLY');
      expect(notificationBuffer.subject).toBe(commentReplyAuditEvent.userUri);
      expect(notificationBuffer.object).toBe(
        commentReplyAuditEvent.contexts.newState['itonics@files-node/Models/interfaces/Comment'].createdBy
      );
      validateCommentNotificationBufferVariables(notificationBuffer);
      expect(notificationBuffer.variables.comment.content).toBe('<strong>@Reewaj Shrestha</strong>  test test');
      expect(notificationBuffer.actionUrl).toBe('https://reewaj-test.itonics-test.io/explorer/tohZyyydQuvgNMsF/detail/J1W2XWigQo3V7Unf');
    });

    it('should convert audit event for comment with user and element mention', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(commentReplyWithUserAndElementMention);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getCommentReplyNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      // const notificationBuffer = await serviceContainer.get(NotificationBufferService).get();
      // const userPreferences = await serviceContainer.get(RecipientService).get();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('COMMENT_REPLY');
      expect(notificationBuffer.subject).toBe(commentReplyAuditEvent.userUri);
      expect(notificationBuffer.object).toBe(
        commentReplyAuditEvent.contexts.newState['itonics@files-node/Models/interfaces/Comment'].createdBy
      );
      validateCommentNotificationBufferVariables(notificationBuffer);
      expect(notificationBuffer.variables.comment.content).toBe(
        '<strong>@Reewaj Shrestha</strong>  what about this element  <a href=https://reewaj-test.itonics-dev.io/explorer/fmsPVy1tGnk2HtEk/detail/EQ1hDMWarWsrsZV>Caraxes</a>'
      );
    });

    it('should convert audit event for comment mention', async () => {
      rawEventDataSource.read = jest.fn().mockImplementation(() => {
        return Promise.resolve(commentMentionAuditEvent);
      });

      notificationEventConfigService.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(getCommentMentionNotificationEventConfig());
      });
      const notificationBuffer = await transform();
      expect(notificationBuffer).toBeDefined();
      expect(notificationBuffer.userPreferences).toBeDefined();
      expect(notificationBuffer.predicate).toBe('COMMENT_MENTION');
      expect(notificationBuffer.subject).toBe(commentReplyAuditEvent.userUri);
      expect(notificationBuffer.object).toBe(
        commentReplyAuditEvent.contexts.newState['itonics@files-node/Models/interfaces/Comment'].createdBy
      );
      expect(notificationBuffer.actionUrl).toBe('https://reewaj-test.itonics-test.io/explorer/fFnhyUEE4geiuNrn/detail/uri123');
      validateCommentNotificationBufferVariables(notificationBuffer);
    });

    function validateCommentNotificationBufferVariables(notificationBuffer: NotificationBuffer) {
      expect(notificationBuffer.variables).toBeDefined();
      const variables = notificationBuffer.variables;
      expect(variables.user).toBeDefined();
      expect(Object.keys(variables.user)).toEqual(expect.arrayContaining(['firstName', 'lastName']));
      expect(variables.comment).toBeDefined();
      expect(Object.keys(variables.comment)).toEqual(expect.arrayContaining(['content']));
      expect(variables.element).toBeDefined();
      expect(Object.keys(variables.element)).toEqual(expect.arrayContaining(['title']));
    }
  });
  function validateElementNotificationBufferVariables(notificationBuffer: NotificationBuffer) {
    expect(notificationBuffer.variables).toBeDefined();
    const variables = notificationBuffer.variables;
    expect(variables.user).toBeDefined();
    expect(Object.keys(variables.user)).toEqual(expect.arrayContaining(['firstName', 'lastName']));
    expect(variables.element).toBeDefined();
    expect(Object.keys(variables.element)).toEqual(expect.arrayContaining(['elementName', 'elementType']));
  }

  function transform(auditEvent: AuditEventBase = getAuditEventBase()) {
    return serviceContainer.get(NotificationEventConverter).transform(auditEvent);
  }
});

function getAuditEventBase(): AuditEventBase {
  return {
    sourceUri: 'ltBURmSps2Us70f7',
    sourceType: SourceType.SPACE,
    objectUri: 'nk24XhNOvyEq33h',
    objectName: 'Demo Element III',
    timestamp: 1655463417468,
    userUri,
    type: 'itonics@elements-node/contracts/elements/Element',
    subAction: 'ELEMENT_UPDATED',
    action: ActionType.UPDATE,
    eventUri: 'Zkmlc28u6DtIhMhSFRuYMIWmaKiM8k2VlYnaaFLP',
    status: EventStatus.ENRICHED,
    key: 'SPACE/ltBURmSps2Us70f7/2022/6/17/1655463417532_5488a327-a7db-4cc1-92cd-fd830b7a459f'
  };
  // tslint:disable-next-line:max-file-line-count
}
