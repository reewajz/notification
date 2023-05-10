import { DynamoDbService } from '@itonics/aws';
import { Inject, InjectDependencies, Logger } from '@itonics/core';
import { DI_CONFIG, SQSListener } from '@itonics/lambda';
import { SQSRecord } from 'aws-lambda';
import SESV2 from 'aws-sdk/clients/sesv2';
import { plainToInstance } from 'class-transformer';
import { getConnection } from 'typeorm';
import { AppConfig } from '../../../Contracts/AppConfig';
import { DynamoDbUtils } from '../../../common/aws/dynamo/DynamoDbUtils';
import { Results } from '../../../common/interfaces/Results';
import { BounceRecord } from '../../Contracts/BounceRecord';
import { BounceEventsMessage } from '../Messages/BounceEventMessage';

@InjectDependencies
export class BounceEventListener implements SQSListener {
    public subscribesTo: string;
    private readonly tableName = 'BounceList';

    constructor(
        @Inject(DI_CONFIG) config: AppConfig,
        private readonly logger: Logger,
        private readonly dynamoService: DynamoDbService,
        private readonly sesv2: SESV2,
    ) {
        this.subscribesTo = config.sqs.receivingFrom.bounce_handler_queue_name;
    }

    // tslint:disable cyclomatic-complexity
    public async handle(record: SQSRecord): Promise<void> {
        this.logger.info('Event received from SQS', {record});
        const message: BounceEventsMessage = plainToInstance(
            BounceEventsMessage,
            JSON.parse(record.body)
        );

        const bounceMessage = JSON.parse(message.Message);
        this.logger.info('Parsed Message from SQS', { bounceMessage });

        const notificationType: string = bounceMessage.notificationType;
        // Return if the notification type is not bounce
        if (notificationType !== 'Bounce') { return; }

        const bounceType: string = bounceMessage.bounce.bounceType;
        // Return if the bounce type is not permanent.
        // Transient, Temporary bounce may be due to email full, out of ofc, etc.
        if (bounceType !== 'Permanent') { return; }

        // Add the bounced email data to Dynamo
        const bounceEmailDestination: string = bounceMessage.mail.destination[0];
        const bounceEmailDomain: string = bounceEmailDestination.split('@')[1];
        const bounceActor: string = bounceMessage.mail.sendingAccountId;
        const attributes: BounceRecord = {
            bounce_email: bounceEmailDestination,
            bounce_domain: bounceEmailDomain,
            bounce_actor: bounceActor,
            bounce_timestamp: new Date(bounceMessage.mail.timestamp).getTime()
        };
        await this.dynamoService.put(this.tableName, attributes);

        // Add the bounced email to SES Supression List
        const SESSupressionEmailParams = {
            EmailAddress: bounceEmailDestination,
            Reason: 'BOUNCE'
        };
        this.sesv2.putSuppressedDestination(SESSupressionEmailParams, (err, data) => {
            if (err) {
                this.logger.error('Put Email in SES Supression List Error', { err });
            } else {
                this.logger.info('Put Email in SES Supression List Successfull', { data });
            }
        });

        // Mark the bounced user's invitation as CANCELED
        await getConnection().query(`UPDATE tenant.invitation SET "status" = 'CANCELED' WHERE "email" = $1`,
            [bounceEmailDestination]);

        // Check in dynamo if a domain has bounces
        const filterExpression = 'bounce_domain = :bounce_domain';
        const expressionAttributeValues = { ':bounce_domain': bounceEmailDomain };
        const domainResults: Results<BounceRecord> = await DynamoDbUtils.scan(
            this.dynamoService,
            this.tableName,
            undefined,
            undefined,
            filterExpression,
            expressionAttributeValues
        );
        this.logger.info('Dynamo Records For Bounced Domain', { domainResults });

        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime();
        if (domainResults.items && domainResults.items.length) {
            const domainResultsCount = domainResults.items.length;
            // Check if a domain has bounced more than 3 times in the last 24 hrs
            const domain24hrRecords = domainResults.items.filter((item) => item.bounce_timestamp > yesterday);

            if (domainResultsCount >= 10 || domain24hrRecords.length >= 3) {
                // The domain is suspicious. Report this domain to monitoring
                this.logger.warn(`Suspicious Domain Alert: Too many bounces from domain ${bounceEmailDomain}`,
                    { domain: bounceEmailDomain });
            }
        }

        // Check in dynamo if an actor has bounces within 24 hrs
        const actorFilterExpression = 'bounce_actor = :bounce_actor and bounce_timestamp > :yesterday ';
        const actorExpressionAttributeValues = { ':bounce_actor': bounceActor, ':yesterday': yesterday };
        const actorResults: Results<BounceRecord> = await DynamoDbUtils.scan(
            this.dynamoService,
            this.tableName,
            undefined,
            undefined,
            actorFilterExpression,
            actorExpressionAttributeValues
        );
        this.logger.info('Dynamo Records For Bounced Actor Within The Last 24 hr.', { actorResults });

        if (actorResults.items && actorResults.items.length >= 3) {
            // The actor is suspicious. Report this actor to monitoring
            this.logger.warn(`Suspicious User Alert: Too many bounces from user ${bounceActor}`,
                    { user: bounceActor });
        }
    }
}
