import { AuditEvent } from '@itonics/audit-client';
import { InjectDependencies, Logger } from '@itonics/core';
import { User } from '@itonics/core/dist/types/tenant/model';
import { NotificationConverterConfig } from '../../../common/config/config';
import { KeyValueMap } from '../../../common/interfaces/KeyValueMap';
import { QuillObject, QuillUtils } from '../../../common/utils/QuillUtils';
import { NotificationEventConfig } from '../../interfaces/NotificationEventConfig';
import { ActionUriGenerator } from '../ActionUriGenerator';
import { NotificationEventConfigService } from '../NotificationEventConfigService';
import { QueryUtils } from '../QueryUtils';
import { AuditLogsPreprocessor } from './AuditLogsPreprocessor';

@InjectDependencies
export class CommentPreProcessor implements AuditLogsPreprocessor {
  constructor(
    private readonly logger: Logger,
    private readonly notificationEventConfigService: NotificationEventConfigService,
    private readonly config: NotificationConverterConfig
  ) {}

  // tslint:disable-next-line:cyclomatic-complexity
  public async process(auditEvent: AuditEvent, source: string): Promise<NotificationEventConfig> {
    if (auditEvent.subAction === 'COMMENT_CREATED' && auditEvent.sourceType === 'COMMENT') {
      // for reply
      const comment = await this.getCommentDetails(auditEvent.sourceUri);
      const ownerUri = comment.created_by;
      if (ownerUri !== auditEvent.userUri) {
        await this.parseComment(auditEvent);
        const elementDetails = await this.getElementDetailsUsingCommentUri(auditEvent.sourceUri);
        this.logger.info('recursively fetch fields:', elementDetails);
        const preFetchVariables = { element: { title: elementDetails.label, type: elementDetails.name } };
        const notificationEventConfig = await this.getNotificationConfig('COMMENT_REPLY', source);
        notificationEventConfig.actionUrl = this.addActionUrlElementUri(notificationEventConfig, elementDetails.uri);
        return this.appendExtraFields(notificationEventConfig, { ownerUri, preFetchVariables });
      }
    } else if (auditEvent.subAction === 'COMMENT_CREATED' && auditEvent.sourceType === 'ELEMENT') {
      const elementDetails = await this.getElementDetails(auditEvent.sourceUri);
      const ownerUri = elementDetails.createdByUri;
      const preFetchVariables = { element: { title: elementDetails.label, type: elementDetails.name } };
      if (ownerUri !== auditEvent.userUri) {
        await this.parseComment(auditEvent);
        return this.appendExtraFields(await this.getNotificationConfig(auditEvent.subAction, source), { ownerUri, preFetchVariables });
      }
    } else if (auditEvent.subAction === 'COMMENT_MENTION_CREATED' && auditEvent.type === 'USER' && this.isMentionByDiffUser(auditEvent)) {
      const comment = await this.getCommentDetails(auditEvent.sourceUri);
      // changed the audit type manually to maintain standard with other event
      auditEvent.type = 'itonics@files-node/Models/interfaces/CommentMention';
      const elementDetails = await this.getElementDetailsUsingCommentUri(auditEvent.sourceUri);
      // added comment content as it is missing from audit event
      auditEvent.contexts.newState[auditEvent.type].content = comment.content;
      await this.parseComment(auditEvent);
      const ownerUri = auditEvent.objectUri;
      const preFetchVariables = { element: { title: elementDetails.label, type: elementDetails.name } };
      const notificationEventConfig = await this.getNotificationConfig('COMMENT_MENTION', source);
      notificationEventConfig.actionUrl = this.addActionUrlElementUri(notificationEventConfig, elementDetails.uri);

      return this.appendExtraFields(notificationEventConfig, { ownerUri, preFetchVariables });
    }
    return null;
  }

  ///////////////

  private addActionUrlElementUri(notificationEventConfig: NotificationEventConfig, elementUri: string) {
    return notificationEventConfig.actionUrl.replace('{{elementUri}}', elementUri);
  }

  private async parseComment(auditEvent: AuditEvent) {
    try {
      const quillObj = auditEvent.contexts.newState[auditEvent.type].content;
      const json = JSON.parse(quillObj);
      const userUris = QuillUtils.getMentionUserUris(json);
      const elementUris = QuillUtils.getMentionElementUris(json);
      const userDetails: Array<Partial<User>> = await this.getUserNameForUserUris(userUris);
      const elementDetails: Array<KeyValueMap> = await this.getElementDetailsForUris(elementUris);
      const parsedElements = await this.injectActionUrlForElements(elementDetails, auditEvent);
      auditEvent.contexts.newState[auditEvent.type].content =
        userUris.length || parsedElements.length
          ? await this.injectCommentMentionWithUserAndElementDetails(json, userDetails, parsedElements).then((res) => res.message)
          : QuillUtils.convertQuillJsonToPlainText(quillObj);
    } catch (e) {
      this.logger.error('could not parse the quill delta', e);
    }
  }

  private async injectCommentMentionWithUserAndElementDetails(
    quillObj: QuillObject,
    userDetails: Array<Partial<User>>,
    elementDetails: Array<KeyValueMap>
  ): Promise<{ message: string; userDetails: Array<Partial<User>> }> {
    return QuillUtils.convertQuillDeltaWithUserDetails(quillObj, userDetails, elementDetails);
  }

  private async injectActionUrlForElements(elementDetails: Array<KeyValueMap>, auditEvent: AuditEvent) {
    const actionUriGenerator: ActionUriGenerator = new ActionUriGenerator(auditEvent, this.config);
    const actionUrl = 'https://{{tenantSlug}}.{{domain}}.io/explorer/{{spaceUri}}/detail/elementUri';
    const generatedUrl = await actionUriGenerator.generate(actionUrl);

    return elementDetails.map((element) => {
      return {
        uri: element.uri,
        actionUrl: `<a href=${generatedUrl?.actionUrl.replace('elementUri', element.uri)}>${element.label}</a>`
      };
    });
  }

  private async getUserNameForUserUris(uris: Array<string>): Promise<Array<Partial<User>>> {
    return QueryUtils.queryAll<Array<User>>(
      `select "userUri", "firstName", "lastName", "email" from tenant.user where "userUri" = ANY ($1)`,
      [uris]
    );
  }

  private async getElementDetailsForUris(uris: Array<string>): Promise<Array<KeyValueMap>> {
    return QueryUtils.queryAll<Array<User>>(
      `select "uri", "spaceUri", "createdByUri", "label", "typeUri" from entity.entity where uri = ANY ($1)`,
      [uris]
    );
  }

  private getCommentDetails(commentId: string) {
    return QueryUtils.queryTable<KeyValueMap>(`select * from social.comments where comment_uri = $1`, [commentId]);
  }

  private getElementDetails(elementId: string) {
    return QueryUtils.queryTable<KeyValueMap>(
      `select e.uri, e.label, e."createdByUri", etc.element_type_uri, etc.name from entity.entity as e
                                                      inner join elements.element_type_configs as etc
                                                      on e."typeUri" = etc.element_type_uri
                                                      where e.uri = $1`,
      [elementId]
    );
  }

  private async getElementDetailsUsingCommentUri(commentUri: string) {
    const commentDetails: KeyValueMap = await QueryUtils.queryTable<KeyValueMap>(
      `WITH recursive reply_depth AS (
        SELECT comment_uri, object_uri, object_type
        FROM social.comment_references
        WHERE comment_uri = $1
        UNION
        SELECT t.comment_uri, t.object_uri, t.object_type
        FROM social.comment_references t
               INNER JOIN reply_depth rd ON t.comment_uri = rd.object_uri
      )
       SELECT object_uri, object_type
       FROM reply_depth where object_type <> 'COMMENT'`,
      [commentUri]
    );

    return this.getElementDetails(commentDetails['object_uri']);
  }

  private appendExtraFields(notificationEventConfig: NotificationEventConfig, extraFields: KeyValueMap) {
    if (notificationEventConfig && Object.keys(extraFields).length) {
      return Object.assign(notificationEventConfig, extraFields);
    }
  }

  private getNotificationConfig(uri: string, source: string) {
    return this.notificationEventConfigService.get(uri, source);
  }

  private isMentionByDiffUser(auditEvent: AuditEvent) {
    const newState = Object.values(auditEvent.contexts.newState)[0];
    return newState.createdBy !== newState.objectUri;
  }
}
