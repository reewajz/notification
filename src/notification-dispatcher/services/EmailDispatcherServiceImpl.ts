import { InjectDependencies, Logger } from '@itonics/core';
import { MailService } from '../../common/aws/ses/MailService';
import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { NotificationStatus } from '../../notification-converter/interfaces/NotificationBuffer';
import { NotificationBufferService } from '../../notification-converter/services/NotificationBufferService';
import { DispatcherService } from './DispatcherService';
import { NotificationControlService } from './NotificationControlService';
import { NotificationTemplateFetcherService, Template } from './NotificationTemplateFetcherService';
import { NotificationChannel } from './NotificationUpdateModel';
import { TemplateParserService } from './TemplateParserService';

@InjectDependencies
export class EmailDispatcherServiceImpl implements DispatcherService {
  constructor(
    private readonly logger: Logger,
    private readonly mailService: MailService,
    private readonly templateService: NotificationTemplateFetcherService,
    private readonly templateParserService: TemplateParserService,
    private readonly notificationControlService: NotificationControlService,
    private readonly notificationBufferService: NotificationBufferService
  ) {
  }

  public async dispatch(recipients: Array<UserPreferences>): Promise<void> {
    await this.sendEmailToAllRecipients(recipients);
  }

  private buildSubject(toBeSent: Array<Template>): string {
    const defaultSubject = 'You have new messages.';
    if (toBeSent.length === 1) {
      return toBeSent[0].subject ?? defaultSubject;
    }
    return defaultSubject;
  }

  private async sendEmailToAllRecipients(recipients: Array<UserPreferences>) {
    const emailResult: { rejected: Array<string>, dispatched: Array<string> } = {
      dispatched: [],
      rejected: []
    };
    await Promise.all(
      recipients.map(async (recipient) => {
        if (recipient.notificationChannel === 'email') {

          const messages: Array<Template | undefined> = await Promise.all(
            recipient.notificationBuffer.map(async (buffer) => {

              const isNotificationRequired = await this.notificationControlService
                .isNotificationEnabledFor(
                  buffer.tenantUri,
                  buffer.spaceUri,
                  recipient.uri,
                  recipient.notificationChannel.toLowerCase() as NotificationChannel);

              if (!isNotificationRequired) {
                this.logger.debug('Notification disabled for user', {
                  tenantUri: buffer.tenantUri,
                  spaceUri: buffer.spaceUri,
                  userUri: recipient.userUri,
                  channel: recipient.notificationChannel
                });
                emailResult.rejected.push(buffer.uri);
                return Promise.resolve(undefined);
              } else {
                emailResult.dispatched.push(buffer.uri);
              }

              const template = await this.templateService
                .getTemplate('user', buffer.source,
                  buffer.variables?.notificationType || buffer.predicate
                );
              const languageTemplate = template.templates[recipient.language || 'en'] || template.templates['en'];
              languageTemplate.userProfileUrl = buffer.variables.userProfileLink;
              return this.templateParserService.parse(languageTemplate, [buffer.variables, { actionUrl: buffer.actionUrl }]);
            })
          );
          const toBeSent: Array<Template> = messages.filter((message) => message != null);
          if (toBeSent.length === 0) {
            return Promise.resolve();
          }

          const subjectTitle = this.buildSubject(toBeSent);

          const result = this.mailService.sendTemplateMail(recipient.email, 'NotificationTemplate', {
            subject: subjectTitle,
            messages: toBeSent,
            options: {
              messagesCount: messages.length,
              userProfileUrl: toBeSent[0].userProfileUrl,
              showNotificationCountHeader: messages.length >= 2
            }
          });

          await this.notificationBufferService.bulkUpdate(emailResult.dispatched, NotificationStatus.dispatched);
          await this.notificationBufferService.bulkUpdate(emailResult.rejected, NotificationStatus.blocked);
          return result;
        }
      })
    );
  }
}
