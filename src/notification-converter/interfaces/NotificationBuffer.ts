import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { SourceType } from './NotificationCategories';
import { NotificationOverrides } from './NotificationEventConfig';

export enum NotificationStatus {
  aggregated = 'aggregated',
  dispatched = 'dispatched',
  blocked = 'blocked',
  waitingForAggregation = 'waitingForAggregation'
}

export interface NotificationBuffer {
  uri?: string;

  subject: string;

  predicate: string;

  object: string;

  userPreferences?: Array<UserPreferences>;

  source: SourceType;

  variables?: NotificationOverrides;

  spaceUri?: string;

  tenantUri?: string;

  status?: NotificationStatus;

  createdOn?: number;

  updatedOn?: number;

  actionUrl?: string;
}
