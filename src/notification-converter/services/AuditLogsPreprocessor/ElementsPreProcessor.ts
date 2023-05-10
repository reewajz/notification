import { AuditEvent } from '@itonics/audit-client';
import { InjectDependencies, Logger } from '@itonics/core';
import { KeyValueMap } from '../../../common/interfaces/KeyValueMap';
import { JsonWalker } from '../../../common/utils/JsonWalker';
import { Utils } from '../../../common/utils/Utils';
import { Audience } from '../../interfaces/Audience';
import { NotificationEventConfig, NotificationOverrides } from '../../interfaces/NotificationEventConfig';
import { AuditIntent, PhaseLock, WorkflowStatus } from '../../interfaces/WorkflowStatus';
import { NotificationEventConfigService } from '../NotificationEventConfigService';
import { QueryUtils } from '../QueryUtils';
import { AuditLogsPreprocessor } from './AuditLogsPreprocessor';

@InjectDependencies
export class ElementsPreProcessor implements AuditLogsPreprocessor {
  private static BelongsToUri = 'AZGBZdoVdaEngTA';
  constructor(private readonly logger: Logger, private readonly notificationEventConfigService: NotificationEventConfigService) {}

  // tslint:disable-next-line:cyclomatic-complexity
  public async process(auditEvent: AuditEvent, source: string): Promise<NotificationEventConfig & { overrides?: NotificationOverrides }> {
    if (auditEvent.subAction === 'ELEMENT_UPDATED') {
      const diff = Utils.diff(auditEvent.contexts.oldState, auditEvent.contexts.newState);
      const status = auditEvent.contexts.newState[auditEvent.type].status;
      const diffWalker = new JsonWalker(diff);
      const hasFieldValuesInDiffs = diffWalker.canWalk([auditEvent.type, 'fieldValues']);
      if (hasFieldValuesInDiffs) {
        const newStateWalker = new JsonWalker(auditEvent.contexts.newState);
        const collector = newStateWalker.collectValuesAtPath(diffWalker);
        if (collector[4] === auditEvent.contexts.newState[auditEvent.type].updatedByUri) {
          return;
        }
        const fieldUri = collector?.[2]?.fieldUri;
        if (fieldUri != null && auditEvent.contexts.newState[auditEvent.type].status === 'published') {
          if (fieldUri === ElementsPreProcessor.BelongsToUri) {
            return this.processElementWithParentChildRelation(auditEvent, collector[2].value[0], source);
          }
          const field: KeyValueMap = await this.getFieldDetails(fieldUri);
          if (field?.field_type_uri === 'user') {
            const config: NotificationEventConfig = await this.getNotificationConfig(`element_${status}`.toUpperCase(), source);
            config.audience = [Audience.specificUser];
            const newlyAddedActor = collector[4] as any as string;
            config.preFetchVariables = {
              ...config.preFetchVariables,
              audiences: [newlyAddedActor],
              notificationType: 'FieldValueChanges',
              fieldName: field.name
            };
            return config;
          }
        }
      }
    }

    if (auditEvent.subAction === 'ELEMENT_UPDATED' && this.isUpdatedByDiffUser(auditEvent)) {
      this.logger.info('Updated by another user:', auditEvent.userUri);
      const diff = this.getDiff(auditEvent.contexts.newState, auditEvent.contexts.oldState);
      const status = diff[auditEvent.type].status;
      const fieldValues = diff[auditEvent.type].fieldValues;
      if (status) {
        this.logger.info('Getting config with uri', `element_${status}`.toUpperCase());
        return this.getNotificationConfig(`element_${status}`.toUpperCase(), source);
      }

      if (auditEvent.contexts.newState[auditEvent.type].status !== 'published') {
        return;
      }
      if (fieldValues.length) {
        // assuming that only one filed values changes at a time
        const fieldDetails = await this.getFieldDetails(fieldValues[0].fieldUri);
        return this._processFieldDetails(fieldDetails, fieldValues[0].value, source);
      }
    } else if (auditEvent.subAction === 'ELEMENT_RATED') {
      const element = await this.getElementDetails(auditEvent.objectUri);
      const ownerUri = element?.createdByUri;
      if (ownerUri && this.isBothUrisSame(ownerUri, auditEvent.userUri)) {
        return Object.assign(await this.getNotificationConfig(auditEvent.subAction, source), { ownerUri });
      }
    } else if (auditEvent.subAction === 'ELEMENT_CREATED') {
      const newState = auditEvent.contexts.newState[auditEvent.type];
      const fieldValues: KeyValueMap = newState?.fieldValues.find(
        (item: KeyValueMap) => item.fieldUri === ElementsPreProcessor.BelongsToUri
      );
      if (fieldValues && Object.keys(fieldValues).length) {
        return this.processElementWithParentChildRelation(auditEvent, fieldValues?.value[0], source);
      }
    } else {
      return this.getNotificationConfig(auditEvent.subAction, source);
    }
    return;
  }

  //////////

  private async _processFieldDetails(fieldDetails: KeyValueMap, fieldValue: string, source: string) {
    function checkForWorkFlowStatusPhase(workflowStatus: WorkflowStatus, phase: string) {
      return workflowStatus.auditDelta && workflowStatus.auditDelta.intent === phase;
    }

    try {
      if (fieldDetails?.field_type_uri === 'workflowStatus') {
        const workflowStatus: WorkflowStatus = JSON.parse(fieldValue);
        if (checkForWorkFlowStatusPhase(workflowStatus, AuditIntent.PHASE_CHANGE)) {
          const preFetchVariables = {
            phases: {
              from: workflowStatus.auditDelta.previousValue.currentPhaseTitle,
              to: workflowStatus.auditDelta.currentValue.currentPhaseTitle
            }
          };

          return this.appendExtraFields(await this.getNotificationConfig(`ELEMENT_PHASE_CHANGE`, source), {
            preFetchVariables
          });
        }
        if (checkForWorkFlowStatusPhase(workflowStatus, AuditIntent.LOCKED_UPDATE)) {
          /*
          while updating task from Revive Reject we get status as {locked: "rejected"}
          but while updating phase lock from Reject to Revive we don't get any status
           */
          return this.getLockedUpdateNotificationConfig(workflowStatus, source);
        }
        return;
      }
    } catch (err) {
      this.logger.error('Error received while parsing workflowStatus data', err);
    }
  }

  private async processElementWithParentChildRelation(auditEvent: AuditEvent, parentElementUri: string, source: string) {
    const elementDetails = await this.getElementDetailsWithTypeDetails(parentElementUri);
    const ownerUri = elementDetails.createdByUri;

    const preFetchVariables = { parentElement: { title: elementDetails.label, type: elementDetails.name } };

    if (this.isBothUrisSame(ownerUri, auditEvent.userUri)) {
      return Object.assign(await this.getNotificationConfig('ELEMENT_CHILD_CREATED', source), { ownerUri, preFetchVariables });
    }
  }

  private getLockedUpdateNotificationConfig(workflowStatus: WorkflowStatus, source: string) {
    if (workflowStatus.auditDelta.currentValue.locked) {
      const lockedValue = workflowStatus.auditDelta.currentValue.locked;
      if (lockedValue === PhaseLock.REJECTED) {
        return this.getNotificationConfig('ELEMENT_REJECTED', source);
      }
    }
    if (workflowStatus.auditDelta.previousValue.locked) {
      const lockedValue = workflowStatus.auditDelta.previousValue.locked;
      if (lockedValue === PhaseLock.REJECTED) {
        return this.getNotificationConfig('ELEMENT_REVIVED', source);
      }
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private getDiff(newState: KeyValueMap, oldState: KeyValueMap) {
    function isEmptyObject(obj: KeyValueMap) {
      return Object.keys(obj).length === 0;
    }

    function getDifference(array1: Array<KeyValueMap>, array2: Array<KeyValueMap>) {
      return array1.filter((object1) => {
        return !array2.some((object2) => {
          // might need to refactor if fieldValues have diff attributes to compare?
          return JSON.stringify(object1.value) === JSON.stringify(object2.value);
        });
      });
    }

    const result: KeyValueMap = {};
    let changes;
    for (const key in oldState) {
      if (Array.isArray(newState[key]) && Array.isArray(oldState[key])) {
        result[key] = getDifference(newState[key], oldState[key]);
      } else if (typeof newState[key] === 'object' && typeof oldState[key] === 'object') {
        changes = this.getDiff(newState[key], oldState[key]);
        if (isEmptyObject(changes) === false) {
          result[key] = changes;
        }
      } else if (newState[key] !== oldState[key]) {
        result[key] = newState[key];
      }
    }
    return result;
  }

  private getFieldDetails(fieldUri: string): Promise<KeyValueMap> {
    return QueryUtils.queryTable<KeyValueMap>(`select * from elements.fields where uri = $1`, [fieldUri]);
  }

  private appendExtraFields(notificationEventConfig: NotificationEventConfig, extraFields: KeyValueMap) {
    if (notificationEventConfig && Object.keys(extraFields).length) {
      return Object.assign(notificationEventConfig, extraFields);
    }
  }

  private isUpdatedByDiffUser(auditEvent: AuditEvent) {
    const newState = auditEvent.contexts.newState[auditEvent.type];
    return this.isBothUrisSame(newState.createdByUri, newState.updatedByUri);
  }

  private isBothUrisSame(uri1: string, uri2: string) {
    return uri1 !== uri2;
  }

  private getNotificationConfig(uri: string, source: string): Promise<NotificationEventConfig> {
    return this.notificationEventConfigService.get(uri, source);
  }

  private getElementDetails(elementId: string, status: string = 'published') {
    return QueryUtils.queryTable<KeyValueMap>(`select * from entity.entity where uri = $1 AND status = $2`, [elementId, status]);
  }

  private getElementDetailsWithTypeDetails(elementId: string) {
    return QueryUtils.queryTable<KeyValueMap>(
      `select e.uri, e.label, e."createdByUri", etc.element_type_uri, etc.name from entity.entity as e
                                                      inner join elements.element_type_configs as etc
                                                      on e."typeUri" = etc.element_type_uri
                                                      where e.uri = $1`,
      [elementId]
    );
  }
}
