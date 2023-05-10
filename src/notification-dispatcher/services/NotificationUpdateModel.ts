export enum NotificationLevel {
  Space = 'space',
  Tenant = 'tenant',
  User = 'user',
  System = 'system'
}

export enum NotificationChannel {
  Email = 'email',
  Slack = 'slack',
}


export interface NotificationDeactivateTableModel {
  identifier: string;
  level: NotificationLevel;
  channel: NotificationChannel;
  uri: string;
}

export type QueryNotificationDeactivateStatusModel = Partial<NotificationDeactivateTableModel>;


export function buildIdentifier(uri: string, channel: NotificationChannel, level: NotificationLevel) {
  if (level === NotificationLevel.System) {
    uri = '*';
  }
  return `${level}/${uri}/${channel}`;
}

export abstract class NotificationUpdateCommand {
  protected constructor(
    readonly uri: string,
    readonly channel: NotificationChannel,
    readonly level: NotificationLevel
  ) {
  }


  get model() {
    return {
      identifier: buildIdentifier(this.uri, this.channel, this.level),
      level: this.level,
      channel: this.channel,
      uri: this.uri
    } as const;
  }
}

export class GeneralNotificationUpdateCommand extends NotificationUpdateCommand {
  constructor(
    readonly uri: string,
    readonly channel: NotificationChannel,
    readonly level: NotificationLevel.User | NotificationLevel.Tenant | NotificationLevel.Space
  ) {
    super(uri, channel, level);
  }
}

export class SystemWideNotificationUpdateCommand extends NotificationUpdateCommand {

  constructor(readonly channel: NotificationChannel) {
    super('*', channel, NotificationLevel.System);
  }
}
