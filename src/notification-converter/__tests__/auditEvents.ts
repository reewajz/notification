const userUri = 'd168c75f-9179-41bc-a11f-e790e8d93eef';
const userUri2 = 'ab54be24-d255-4725-9391-f5794f453c24';
const userUri3 = '8f3b3c9e-7129-4e24-8fd2-14889ca9d258';
const origin = 'test updated';
const myWorkSpaceOrigin = 'My Workspace';
const tenantOrg = {
  aHAqZJjUsDtuKQAO: 'Org'
};
const elementType = 'itonics@elements-node/contracts/elements/Element';
const commentType = 'itonics@files-node/Models/interfaces/Comment';
export const elementRatedAuditEvent = {
  sourceUri: 'fFnhyUEE4geiuNrn',
  sourceType: 'SPACE',
  objectUri: 'a5ALq7hmDUduVu4',
  objectName: 'Fiat 5',
  timestamp: 1663651400053,
  userUri,
  type: elementType,
  action: 'UPDATE',
  subAction: 'ELEMENT_RATED',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/ElementRating': {
        context: 'default',
        ratingValues: [
          {
            value: 5,
            fieldUri: 'e2jywUWGzxLsyZ5',
            ratingValue: 5,
            lastRatedOn: 1663651399991
          }
        ]
      }
    },
    oldState: {},
    updatedState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: 'a5ALq7hmDUduVu4',
        version: 9
      }
    }
  },
  eventUri: 'bW1kcCsdjekRcfgitZW8bnQv8k9V79fSB20qfJAR',
  status: 'ENRICHED',
  key: 'SPACE/fFnhyUEE4geiuNrn/2022/9/20/1663651400102_c9d4e9de-dc4c-4a44-bcea-bfdd5bc1b784',
  translations: {
    SPACE: {
      fFnhyUEE4geiuNrn: 'reewaj'
    },
    TENANT: {
      Qf05guK7G6gRglp8: 'OxygenOs'
    },
    'itonics@elements-node/contracts/types/Field': {
      e2jywUWGzxLsyZ5: 'Potential Impact'
    },
    'itonics@elements-node/contracts/types/ElementType': {
      RTLapL0ecryOhvw: 'Trend'
    },
    e2jywUWGzxLsyZ5: {
      0: 'None',
      1: 'Very Low',
      2: 'Low',
      3: 'Medium',
      4: 'High',
      5: 'Very High'
    }
  }
};

export const elementPhaseChangeAuditEvent = {
  sourceUri: 'fmsPVy1tGnk2HtEk',
  sourceType: 'SPACE',
  objectUri: '0XOhcXx7Z7icrL7',
  objectName: 'Fresh 4',
  timestamp: 1663912722528,
  userUri,
  type: elementType,
  subAction: 'ELEMENT_UPDATED',
  action: 'UPDATE',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '0XOhcXx7Z7icrL7',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'Fresh 4',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'Fresh 4',
        status: 'published',
        createdOn: 1663832646229,
        updatedOn: 1663912722312,
        createdByUri: userUri2,
        updatedByUri: userUri,
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        origin: myWorkSpaceOrigin,
        creatorType: 'USER',
        updaterType: 'USER',
        version: 4,
        fieldValues: [
          {
            value: ['ct21UP1B9odVYIL'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"ideaFunnel","currentPhase":"ideaFunnel_phase3","phases":{"ideaFunnel_phase1":{"taskStatus":{"ideaFunnel_task1":{"value":true},"ideaFunnel_task2":{"value":true}}},"ideaFunnel_phase2":{"taskStatus":{"ideaFunnel_task3":{"value":true},"ideaFunnel_task4":{"value":true},"ideaFunnel_task5":{"value":true},"ideaFunnel_task6":{"value":true},"ideaFunnel_task7":{"value":true}}}},"auditDelta":{"intent":"phase_change","previousValue":{"currentPhaseTitle":"Concept Development","taskStatus":{"ideaFunnel_task3":{"taskTitle":"Idea Owner: Add Business Case","value":true},"ideaFunnel_task4":{"taskTitle":"Idea Owner: Add Implementation Plan","value":true},"ideaFunnel_task5":{"taskTitle":"Campaign Manager: Assign Evaluators","value":true},"ideaFunnel_task6":{"taskTitle":"Evaluators: Rate Idea","value":true},"ideaFunnel_task7":{"taskTitle":"Campaign Manager: Review & Decide","value":true}}},"currentValue":{"currentPhaseTitle":"Implementation","taskStatus":{"ideaFunnel_task8":{"taskTitle":"Idea Owner: Demonstrate Results","value":false},"ideaFunnel_task9":{"taskTitle":"Campaign Manager: Review & Decide","value":false}}}}}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ]
      }
    },
    oldState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '0XOhcXx7Z7icrL7',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'Fresh 4',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'Fresh 4',
        status: 'published',
        createdOn: 1663832646229,
        updatedOn: 1663912670792,
        createdByUri: userUri2,
        updatedByUri: userUri,
        version: 3,
        fieldValues: [
          {
            value: ['ct21UP1B9odVYIL'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"ideaFunnel","currentPhase":"ideaFunnel_phase2","phases":{"ideaFunnel_phase1":{"taskStatus":{"ideaFunnel_task1":{"value":true},"ideaFunnel_task2":{"value":true}}},"ideaFunnel_phase2":{"taskStatus":{"ideaFunnel_task3":{"value":true},"ideaFunnel_task4":{"value":true},"ideaFunnel_task5":{"value":true},"ideaFunnel_task6":{"value":true},"ideaFunnel_task7":{"value":true}}}},"auditDelta":{"intent":"task_update","previousValue":{"currentPhaseTitle":"Concept Development","taskStatus":{"ideaFunnel_task3":{"taskTitle":"Idea Owner: Add Business Case","value":true},"ideaFunnel_task4":{"taskTitle":"Idea Owner: Add Implementation Plan","value":true},"ideaFunnel_task5":{"taskTitle":"Campaign Manager: Assign Evaluators","value":true},"ideaFunnel_task6":{"taskTitle":"Evaluators: Rate Idea","value":true},"ideaFunnel_task7":{"taskTitle":"Campaign Manager: Review & Decide","value":null}}},"currentValue":{"currentPhaseTitle":"Concept Development","taskStatus":{"ideaFunnel_task3":{"taskTitle":"Idea Owner: Add Business Case","value":true},"ideaFunnel_task4":{"taskTitle":"Idea Owner: Add Implementation Plan","value":true},"ideaFunnel_task5":{"taskTitle":"Campaign Manager: Assign Evaluators","value":true},"ideaFunnel_task6":{"taskTitle":"Evaluators: Rate Idea","value":true},"ideaFunnel_task7":{"taskTitle":"Campaign Manager: Review & Decide","value":true}}}}}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ],
        creatorType: 'USER',
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        updaterType: 'USER',
        origin: myWorkSpaceOrigin
      }
    }
  },
  translations: {
    SPACE: {
      fmsPVy1tGnk2HtEk: myWorkSpaceOrigin
    },
    'itonics@elements-node/contracts/types/Field': {
      AZGBZdoVdaEngTA: 'belongsTo',
      RkpTt3mDjTX4ppa: 'Workflow Status'
    },
    'itonics@elements-node/contracts/types/ElementType': {
      B0sD6dPm2RhnEzv: 'Idea'
    },
    TENANT: {
      aHAqZJjUsDtulQAE: 'Org Dash'
    }
  },
  eventUri: 'u0YWtb64q4ZLgtS88MQzeVPgUJTbskf8JoJofVHG',
  status: 'ENRICHED',
  key: 'SPACE/fmsPVy1tGnk2HtEk/2022/9/23/1663912722570_1e8ec42f-250c-4c36-898a-345f149d2292'
};

export const elementRejectAuditEvent = {
  sourceUri: 'fmsPVy1tGnk2HtEk',
  sourceType: 'SPACE',
  objectUri: '7aBEohZBhBI4sLe',
  objectName: 'Idea 4',
  timestamp: 1666329988338,
  userUri,
  type: elementType,
  subAction: 'ELEMENT_UPDATED',
  action: 'UPDATE',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '7aBEohZBhBI4sLe',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'Idea 4',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'Idea 4',
        status: 'published',
        createdOn: 1666256662888,
        updatedOn: 1666329988090,
        createdByUri: userUri2,
        updatedByUri: userUri,
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        origin: myWorkSpaceOrigin,
        creatorType: 'USER',
        updaterType: 'USER',
        version: 4,
        fieldValues: [
          {
            value: ['z6XvQ6rLuD5GR0M'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"ideaFunnel","currentPhase":"ideaFunnel_phase1","phases":{"ideaFunnel_phase1":{"taskStatus":{"ideaFunnel_task1":{"value":false},"ideaFunnel_task2":{"value":false}}}},"auditDelta":{"intent":"locked_update","previousValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}}},"currentValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}},"locked":"rejected"}},"locked":"rejected"}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ]
      }
    },
    oldState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '7aBEohZBhBI4sLe',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'Idea 4',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'Idea 4',
        status: 'published',
        createdOn: 1666256662888,
        updatedOn: 1666327169563,
        createdByUri: userUri2,
        updatedByUri: userUri,
        version: 3,
        fieldValues: [
          {
            value: ['z6XvQ6rLuD5GR0M'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"ideaFunnel","currentPhase":"ideaFunnel_phase1","phases":{"ideaFunnel_phase1":{"taskStatus":{"ideaFunnel_task1":{"value":false},"ideaFunnel_task2":{"value":false}}}},"auditDelta":{"intent":"locked_update","previousValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}},"locked":"rejected"},"currentValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}}}}}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ],
        creatorType: 'USER',
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        updaterType: 'USER',
        origin: myWorkSpaceOrigin
      }
    }
  },
  translations: {
    SPACE: {
      fmsPVy1tGnk2HtEk: myWorkSpaceOrigin
    },
    'itonics@elements-node/contracts/types/ElementType': {
      B0sD6dPm2RhnEzv: 'Idea'
    },
    TENANT: tenantOrg
  },
  eventUri: 'pjP3PLI3vVbzFBh8681IjdIlug9rAn1TZQKjEIwW',
  status: 'ENRICHED',
  key: 'SPACE/fmsPVy1tGnk2HtEk/2022/10/21/1666329988715_85990cbf-06db-47ca-8afe-e153c85e137a'
};

export const elementReviveAuditEvent = {
  sourceUri: 'fmsPVy1tGnk2HtEk',
  sourceType: 'SPACE',
  objectUri: '7aBEohZBhBI4sLe',
  objectName: 'Idea 5',
  timestamp: 1666329995541,
  userUri,
  type: elementType,
  subAction: 'ELEMENT_UPDATED',
  action: 'UPDATE',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '7aBEohZBhBI4sLe',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'Idea 4',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'Idea 4',
        status: 'published',
        createdOn: 1666256662888,
        updatedOn: 1666329995404,
        createdByUri: userUri2,
        updatedByUri: userUri,
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        origin: myWorkSpaceOrigin,
        creatorType: 'USER',
        updaterType: 'USER',
        version: 5,
        fieldValues: [
          {
            value: ['z6XvQ6rLuD5GR0M'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"ideaFunnel","currentPhase":"ideaFunnel_phase1","phases":{"ideaFunnel_phase1":{"taskStatus":{"ideaFunnel_task1":{"value":false},"ideaFunnel_task2":{"value":false}}}},"auditDelta":{"intent":"locked_update","previousValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}},"locked":"rejected"},"currentValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}}}}}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ]
      }
    },
    oldState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '7aBEohZBhBI4sLe',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'Idea 4',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'Idea 4',
        status: 'published',
        createdOn: 1666256662888,
        updatedOn: 1666329988090,
        createdByUri: userUri2,
        updatedByUri: userUri,
        version: 4,
        fieldValues: [
          {
            value: ['z6XvQ6rLuD5GR0M'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"ideaFunnel","currentPhase":"ideaFunnel_phase1","phases":{"ideaFunnel_phase1":{"taskStatus":{"ideaFunnel_task1":{"value":false},"ideaFunnel_task2":{"value":false}}}},"auditDelta":{"intent":"locked_update","previousValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}}},"currentValue":{"currentPhaseTitle":"Submission","taskStatus":{"ideaFunnel_task1":{"taskTitle":"Idea Owner: Fill out Idea Form","value":false},"ideaFunnel_task2":{"taskTitle":"Campaign Manager: Review & Decide","value":false}},"locked":"rejected"}},"locked":"rejected"}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ],
        creatorType: 'USER',
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        updaterType: 'USER',
        origin: myWorkSpaceOrigin
      }
    }
  },
  translations: {
    SPACE: {
      fmsPVy1tGnk2HtEk: myWorkSpaceOrigin
    },
    'itonics@elements-node/contracts/types/ElementType': {
      B0sD6dPm2RhnEzv: 'Idea'
    },
    TENANT: tenantOrg
  },
  eventUri: 'yKKBg8AVzxTMq5DdrmzECWOxZixE81pl0plp7fqX',
  status: 'ENRICHED',
  key: 'SPACE/fmsPVy1tGnk2HtEk/2022/10/21/1666329995584_564a20d8-eeca-461d-bc15-5c09de4badd2'
};

export const commentCreateAuditEvent = {
  sourceType: 'ELEMENT',
  sourceUri: 'TtMWFBEo0LaVgH6',
  action: 'UPDATE',
  objectName: 'COMMENT',
  objectUri: 'hdwxNJEc8MzOTlaF',
  timestamp: 1649314928445,
  type: commentType,
  userUri: '41bc-a11f-e790e8d93ee-fd168c75f-9179',
  subAction: 'COMMENT_CREATED',
  contexts: {
    newState: {
      'itonics@files-node/Models/interfaces/Comment': {
        tenantUri: 'fkddlt2Q4imkhmUo',
        commentUri: 'hdwxNJEc8MzOTlaF',
        createdBy: userUri3,
        createdOn: 1649313449995,
        content: '{"ops":[{"insert":"This is test\\n"}]}',
        references: [
          {
            commentUri: 'hdwxNJEc8MzOTlaF',
            objectType: 'EXPLORER-ELEMENT',
            objectTenantUri: 'fkddlt2Q4imkhmUo',
            objectSpaceUri: 'DQfdEcOsqnTXvky1',
            objectUri: 'TtMWFBEo0LaVgH6',
            createdBy: userUri3,
            createdOn: 1649313450394,
            isPinned: false
          }
        ]
      }
    }
  },
  spaceUri: 'DQfdEcOsqnTXvky1',
  bulkAction: 'BULK_CREATE',
  groupUri: 'MkOL4raBXXXiXoxrkWnvcNMd2bP5pBX2hDpwdUie',
  eventUri: '62ySxyDI4KIs4AZREnR7Z4YpsFz4viYhfflGA5nY',
  status: 'ENRICHED',
  key: 'ELEMENT/TtMWFBEo0LaVgH6/2022/4/7/1649313450495_d9cbb6a9-81ea-457f-86af-38eec538552e',
  translations: {
    SPACE: {
      DQfdEcOsqnTXvky1: 'Audit Test V2'
    },
    TENANT: {
      fkddlt2Q4imkhmUo: 'no tenant'
    },
    'itonics@elements-node/contracts/elements/Element': {
      TtMWFBEo0LaVgH6: 'Custom Accetor'
    }
  }
};

export const commentMentionAuditEvent = {
  sourceType: 'COMMENT',
  sourceUri: '06KarYA51M1ecv5K',
  action: 'UPDATE',
  objectName: 'USER',
  objectUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
  type: 'USER',
  timestamp: 1662706249641,
  userUri,
  subAction: 'COMMENT_MENTION_CREATED',
  contexts: {
    newState: {
      'itonics@files-node/Models/interfaces/CommentMention': {
        commentUri: '06KarYA51M1ecv5K',
        objectType: 'USER',
        objectTenantUri: 'Qf05guK7G6gRglp8',
        objectSpaceUri: 'fFnhyUEE4geiuNrn',
        objectUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
        createdBy: userUri,
        createdOn: 1662706249396
      }
    }
  },
  spaceUri: 'fFnhyUEE4geiuNrn',
  bulkAction: 'BULK_CREATE',
  groupUri: 'lFP0Zw1QfDOHAaYgvx2MK8sYbBI3hxszt1Aiakyq',
  eventUri: 'EVoDMcggN0MboULFCsv7RKBYNBa4DDO1ty9kFrKh',
  status: 'ENRICHED',
  key: 'COMMENT/06KarYA51M1ecv5K/2022/9/9/1662706249876_474acff8-278e-4d39-82be-e4ab7f5abc92',
  translations: {
    SPACE: {
      fFnhyUEE4geiuNrn: 'reewaj'
    },
    TENANT: {
      Qf05guK7G6gRglp8: 'OxygenOs'
    }
  }
};

export const commentReplyAuditEvent = {
  sourceType: 'COMMENT',
  sourceUri: 'tohZyyydQuvgNMsF',
  action: 'CREATE',
  objectName: 'COMMENT',
  objectUri: 'J1W2XWigQo3V7Unf',
  timestamp: 1661847245425,
  type: commentType,
  userUri,
  subAction: 'COMMENT_CREATED',
  contexts: {
    newState: {
      'itonics@files-node/Models/interfaces/Comment': {
        tenantUri: 'Qf05guK7G6gRglp8',
        commentUri: 'J1W2XWigQo3V7Unf',
        createdBy: userUri,
        createdOn: 1661847244985,
        content:
          '{"ops":[{"insert":{"mention":{"denotationChar":"@","id":"d168c75f-9179-41bc-a11f-e790e8d93eef","value":""}}},{"insert":" test test"}]}',
        references: [
          {
            commentUri: 'J1W2XWigQo3V7Unf',
            objectType: 'COMMENT',
            objectTenantUri: 'Qf05guK7G6gRglp8',
            objectSpaceUri: 'fFnhyUEE4geiuNrn',
            objectUri: 'tohZyyydQuvgNMsF',
            createdBy: userUri,
            createdOn: 1661847245324,
            isPinned: false
          }
        ]
      }
    }
  },
  spaceUri: 'fFnhyUEE4geiuNrn',
  bulkAction: 'BULK_CREATE',
  groupUri: 'F5bIGvKkrMOa6GLsrsBZ3HmhsMuvbjC7wEVutksD',
  eventUri: '3YrfUzmgDnGr7w0pZxpfzY3t0s3aXKy4fioRtHwG',
  status: 'ENRICHED',
  key: 'COMMENT/tohZyyydQuvgNMsF/2022/8/30/1661847245725_0479ab89-ee2b-4794-8093-9e0768fa2471',
  translations: {
    SPACE: {
      fFnhyUEE4geiuNrn: 'reewaj'
    },
    TENANT: {
      Qf05guK7G6gRglp8: 'OxygenOs'
    }
  }
};

export const commentReplyWithUserAndElementMention = {
  sourceType: 'ELEMENT',
  sourceUri: 'nsQfKQkvc5fUKjV',
  action: 'CREATE',
  objectName: 'COMMENT',
  objectUri: 'vUuCJJwXcv9Jh0Tc',
  timestamp: 1667542966779,
  type: commentType,
  userUri,
  subAction: 'COMMENT_CREATED',
  contexts: {
    newState: {
      'itonics@files-node/Models/interfaces/Comment': {
        tenantUri: 'aHAqZJjUsDtulQAE',
        commentUri: 'vUuCJJwXcv9Jh0Tc',
        createdBy: userUri,
        createdOn: 1667542966253,
        content:
          '{"ops":[{"insert":{"mention":{"denotationChar":"@","id":"d168c75f-9179-41bc-a11f-e790e8d93eef","value":""}}},{"insert":" what about this element "},{"insert":{"mention":{"denotationChar":"#","id":"EQ1hDMWarWsrsZV","value":""}}}]}',
        references: [
          {
            commentUri: 'vUuCJJwXcv9Jh0Tc',
            objectType: 'EXPLORER-ELEMENT',
            objectTenantUri: 'aHAqZJjUsDtulQAE',
            objectSpaceUri: 'fmsPVy1tGnk2HtEk',
            objectUri: 'nsQfKQkvc5fUKjV',
            createdBy: userUri,
            createdOn: 1667542966512,
            isPinned: false
          }
        ]
      }
    }
  },
  spaceUri: 'fmsPVy1tGnk2HtEk',
  bulkAction: 'BULK_CREATE',
  groupUri: 'VuQPBz3wisW1hIsCUAAq2fiDKCBkOm5vIOqAwsT8',
  eventUri: 'oG7JfBaAY3UMu8OddKdXolz7wZVLfryONuowqoAw',
  status: 'ENRICHED',
  key: 'ELEMENT/nsQfKQkvc5fUKjV/2022/11/4/1667542966906_3d80c156-2734-4414-924b-032963b8ffbd',
  translations: {
    SPACE: {
      fmsPVy1tGnk2HtEk: myWorkSpaceOrigin
    },
    TENANT: tenantOrg,
    'itonics@elements-node/contracts/elements/Element': {
      nsQfKQkvc5fUKjV: 'Cap Idea 1'
    }
  }
};

const objectName = 'Demo Element III';
export const elementUpdatedAuditEvent = {
  sourceUri: 'ltBURmSps2Us70f7',
  sourceType: 'SPACE',
  objectUri: 'nk24XhNOvyEq33h',
  objectName,
  timestamp: 1655463417468,
  userUri,
  type: elementType,
  subAction: 'ELEMENT_UPDATED',
  action: 'UPDATE',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: 'nk24XhNOvyEq33h',
        spaceUri: 'ltBURmSps2Us70f7',
        label: objectName,
        elementTypeUri: 'YzZ5nMYnto8iwEf',
        summary: 'Demo element Description',
        status: 'archived',
        createdOn: 1639115715451,
        updatedOn: 1655463417359,
        createdByUri: userUri3,
        updatedByUri: userUri,
        originType: 'SPACE',
        originUri: 'ltBURmSps2Us70f7',
        origin,
        creatorType: 'USER',
        updaterType: 'USER',
        version: 5
      }
    },
    oldState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: 'nk24XhNOvyEq33h',
        spaceUri: 'ltBURmSps2Us70f7',
        label: objectName,
        elementTypeUri: 'YzZ5nMYnto8iwEf',
        summary: 'Demo element Description',
        status: 'published',
        createdOn: 1639115715451,
        updatedOn: 1647338816844,
        createdByUri: userUri3,
        updatedByUri: userUri3,
        version: 4,
        creatorType: 'USER',
        originType: 'SPACE',
        originUri: 'ltBURmSps2Us70f7',
        updaterType: 'USER',
        origin
      }
    }
  },
  translations: {
    SPACE: {
      ltBURmSps2Us70f7: origin
    },
    'itonics@elements-node/contracts/types/ElementType': {
      YzZ5nMYnto8iwEf: 'Demo Element Type'
    },
    TENANT: {
      dkk8PGJiTfqFpUEO: 'Reewaj Updated ...'
    }
  },
  eventUri: 'Zkmlc28u6DtIhMhSFRuYMIWmaKiM8k2VlYnaaFLP',
  status: 'ENRICHED',
  key: 'SPACE/ltBURmSps2Us70f7/2022/6/17/1655463417532_5488a327-a7db-4cc1-92cd-fd830b7a459f'
  // tslint:disable-next-line:max-file-line-count
};

export const elementUpdateWithChildInfo = {
  sourceUri: 'fmsPVy1tGnk2HtEk',
  sourceType: 'SPACE',
  objectUri: 'DyTyEB4rrQwH94n',
  objectName: 'party of power ',
  timestamp: 1670412867137,
  userUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
  type: 'itonics@elements-node/contracts/elements/Element',
  subAction: 'ELEMENT_UPDATED',
  action: 'UPDATE',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: 'DyTyEB4rrQwH94n',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'party of power ',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'nemakipa',
        status: 'published',
        createdOn: 1670412854953,
        updatedOn: 1670412866888,
        createdByUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        updatedByUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        origin: 'My Workspace',
        creatorType: 'USER',
        updaterType: 'USER',
        version: 2,
        fieldValues: [
          {
            value: ['NpqvK16SWMJJODn'],
            fieldUri: 'AZGBZdoVdaEngTA'
          },
          {
            value: [
              '{"uri":"designThinking","currentPhase":"designThinking_phase1","phases":{"designThinking_phase1":{"taskStatus":{"designThinking_task1":{"value":false},"designThinking_task2":{"value":false}}}},"auditDelta":{"intent":"add","previousValue":null,"currentValue":{"currentPhaseTitle":"Empathize","taskStatus":{"designThinking_task1":{"taskTitle":"Create a questionnaire for the user interview","value":false},"designThinking_task2":{"taskTitle":"Conduct user interviews","value":false}}}}}'
            ],
            fieldUri: 'RkpTt3mDjTX4ppa'
          }
        ],
      }
    },
    oldState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: 'DyTyEB4rrQwH94n',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        label: 'party of power ',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'nemakipa',
        status: 'published',
        createdOn: 1670412854953,
        updatedOn: 1670412854953,
        createdByUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        updatedByUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        version: 1,
        creatorType: 'USER',
        originType: 'SPACE',
        originUri: 'fmsPVy1tGnk2HtEk',
        updaterType: 'USER',
        origin: 'My Workspace'
      }
    }
  },
  translations: {
    SPACE: {
      fmsPVy1tGnk2HtEk: 'My Workspace'
    },
    'itonics@elements-node/contracts/types/Field': {
      AZGBZdoVdaEngTA: 'belongsTo',
      RkpTt3mDjTX4ppa: 'Workflow Status'
    },
    'itonics@elements-node/contracts/types/ElementType': {
      B0sD6dPm2RhnEzv: 'Idea'
    },
    TENANT: {
      aHAqZJjUsDtulQAE: 'Subash Org'
    }
  },
  eventUri: 'eclEDaWXSafrXqWjL3OHuQSjjNFYy7w3rcHOkoco',
  status: 'ENRICHED',
  key: 'SPACE/fmsPVy1tGnk2HtEk/2022/12/7/1670412867184_9106f097-a7aa-4684-8f69-fe77182c197c'
};

export const elementParentChild = {
  sourceUri: 'fmsPVy1tGnk2HtEk',
  sourceType: 'SPACE',
  objectUri: '5fQU1SFZJoBQxD3',
  objectName: 'bhaktapure',
  timestamp: 1670221817507,
  userUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
  type: 'itonics@elements-node/contracts/elements/Element',
  subAction: 'ELEMENT_CREATED',
  action: 'CREATE',
  contexts: {
    newState: {
      'itonics@elements-node/contracts/elements/Element': {
        uri: '5fQU1SFZJoBQxD3',
        spaceUri: 'fmsPVy1tGnk2HtEk',
        createdOn: 1670221817200,
        createdByUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        updatedOn: 1670221817200,
        updatedByUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        version: 1,
        label: 'bhaktapure',
        elementTypeUri: 'B0sD6dPm2RhnEzv',
        summary: 'person from bhaktapur',
        status: 'published',
        fieldValues: [
          {
            fieldUri: 'RkpTt3mDjTX4ppa',
            value: [
              '{"uri":"designThinking","currentPhase":"designThinking_phase1","phases":{"designThinking_phase1":{"taskStatus":{"designThinking_task1":{"value":false},"designThinking_task2":{"value":false}}}},"auditDelta":{"intent":"add","previousValue":null,"currentValue":{"currentPhaseTitle":"Empathize","taskStatus":{"designThinking_task1":{"taskTitle":"Create a questionnaire for the user interview","value":false},"designThinking_task2":{"taskTitle":"Conduct user interviews","value":false}}}}}'
            ]
          },
          {
            fieldUri: 'AZGBZdoVdaEngTA',
            value: ['yi0MrLPRv7ywUek']
          }
        ],
        creatorType: 'USER',
        updaterType: 'USER',
        originType: 'SPACE',
        origin: 'My Workspace',
        originUri: 'fmsPVy1tGnk2HtEk'
      }
    },
    oldState: {}
  },
  translations: {
    SPACE: {
      fmsPVy1tGnk2HtEk: 'My Workspace'
    },
    'itonics@elements-node/contracts/types/Field': {
      AZGBZdoVdaEngTA: 'belongsTo',
      RkpTt3mDjTX4ppa: 'Workflow Status'
    },
    'itonics@elements-node/contracts/types/ElementType': {
      B0sD6dPm2RhnEzv: 'Idea'
    },
    TENANT: {
      aHAqZJjUsDtulQAE: 'Subash Org'
    }
  },
  eventUri: 'dNzKm9L98CFpdwF3HNyZk4T0cbk8IXSzN9JT8BN4',
  status: 'ENRICHED',
  key: 'SPACE/fmsPVy1tGnk2HtEk/2022/12/5/1670221817551_1d9ea002-1081-4c2e-8d5f-784a62da90ca'
  // tslint:disable-next-line:max-file-line-count
};
