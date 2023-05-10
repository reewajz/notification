import { KeyValueMap } from '../../common/interfaces/KeyValueMap';
import { Audience } from './Audience';
import { EventDataPath } from './EventDataPath';
import { SourceType } from './NotificationCategories';

export interface NotificationEventConfigWithPreProcessValues extends NotificationEventConfig {
  ownerUri?: string;

  preFetchVariables: KeyValueMap;
}

export interface NotificationEventConfig {
  /*
      partitionKeyName
      will also the way to identify the event
      and will map the audit event to the Notification Settings

      e.g. "explorer.element.published:
     */
  uri: string;

  /*
      The category will be used to map user settings to
      notifications subscriptions
    */
  category?: SourceType;

  /*
        The source type defines the origin of the event
      */
  source: SourceType;

  /*
      The user that generates the action not necessarily the final recipient
    */
  subject: EventDataPath; // will be AuditEventBase.usrUri?

  /*
      This predicate will map with templates or content of the notification
    */
  predicate: EventDataPath;

  /*
      This object will be the URI of the element affected by the actions
      in some cases will help to define the final recipient

      e.g. when we need to send to the owner of an edited element a notification
      that his element was edited
    */
  object: string;

  /*
      Space uri
    */

  spaceUri?: string;
  /*
      Tenant uri
    */
  tenantUri?: string;

  /*
      The final recipients
    */
  audience: Array<Audience>;

  /*
      Owner uri path
    */
  ownerUriPath?: string;

  /*
      Element uri path
    */
  elementUriPath?: string;

  /*
      This can be the owner or another user
    */
  triggerType?: string;

  /*
      This information could be used to inject variables in the notifications
      IMPORTANT: needs to comply with our SOP
    */
  variables?: { [key: string]: string };

  ownerUri?: string;

  preFetchVariables?: NotificationOverrides;

  /*
     For generating url required for cta button
   */
  actionUrl?: string;

  createdBy?: string;

  updatedBy?: string;

  createdOn?: number;

  updatedOn?: number;
}

export interface NotificationOverrides {
  /**
   * holds any specific audiences used when {@link NotificationEventConfig.audience} is {@link Audience.specificUser}
   */
  audiences?: Array<string>;

  /**
   * Overrides the notification type in {@link }
   */
  notificationType?: string;

  [key: string]: any;
}
