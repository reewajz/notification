import { InjectDependencies, Logger } from '@itonics/core';
import { SES } from 'aws-sdk';
import striptags from 'striptags';
import { SES_DOMAIN, SES_REGION } from '../../configs/config';
import { CompositeKeyWithValue } from '../../interfaces/CompositeKeyWithValue';
import { EmailBlacklistService } from '../../services/EmailBlackListService';
import { MailService } from './MailService';

@InjectDependencies
export class SESMailService implements MailService {
  private readonly SES_REGION = SES_REGION; // get ses_region from env
  private readonly SENDERS_EMAIL_ADDRESS = `ITONICS <no-reply@${SES_DOMAIN}>`;
  private readonly _ses: SES;

  constructor(private readonly logger: Logger, private readonly blacklist: EmailBlacklistService) {
    // SES is not available in the Frankfurt region, so we have to
    // force eu-west-1 (Ireland) here
    this._ses = new SES({ region: this.SES_REGION });
  }

  public sendMail(email: string, subject: string, body: string): Promise<boolean> {
    this.blacklist.throwIfBlacklisted(email);

    return new Promise<boolean>((resolve, reject) => {
      // Create sendEmail params
      const params = {
        Destination: {
          /* required */
          ToAddresses: [email]
        },
        Message: {
          /* required */
          Body: {
            /* required */
            Html: {
              Charset: 'UTF-8',
              Data: body
            },
            Text: {
              Charset: 'UTF-8',
              Data: striptags(body)
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject
          }
        },
        Source: this.SENDERS_EMAIL_ADDRESS /* required */
      };

      // Create the promise
      const sendPromise = this._ses.sendEmail(params).promise();

      // Handle promise's fulfilled/rejected states
      sendPromise
        .then((data) => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public sendTemplateMail(email: string, templateId: string, templateData: CompositeKeyWithValue): Promise<boolean> {
    this.blacklist.throwIfBlacklisted(email);
    this.logger.info(`email:: ${email}, templateId: ${templateId}, templateData: ${JSON.stringify(templateData, null, 1)}`);

    return new Promise<boolean>((resolve, reject) => {
      try {
        const params = {
          Destination: {
            /* required */
            ToAddresses: [email]
          },
          Template: templateId /* required */,
          TemplateData: JSON.stringify(templateData) /* required */,
          Source: this.SENDERS_EMAIL_ADDRESS /* required */
        };

        // Create the promise
        const sendPromise = this._ses.sendTemplatedEmail(params).promise();

        // Handle promise's fulfilled/rejected states
        sendPromise
          .then((data) => {
            this.logger.info('The SESTemplateMail mail success', data);
            resolve(true);
          })
          .catch((err) => {
            this.logger.error('The SESTemplateMail mail Error', err);
            reject(err);
          });
      } catch (e) {
        this.logger.error('SES TEMPLATE ERROR', e);
      }
    });
  }
}
