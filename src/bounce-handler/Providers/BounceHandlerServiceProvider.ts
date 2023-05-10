import { DynamoDbService } from '@itonics/aws';
import { ServiceProvider, ServiceRegistration } from '@itonics/core';
import SESV2 from 'aws-sdk/clients/sesv2';
import { config } from '../../config';

export class BounceHandlerServiceProvider implements ServiceProvider {
    registers(): Array<ServiceRegistration> {
        return [
            {
                provide: DynamoDbService,
                use: DynamoDbService
            },
            {
                provide: SESV2,
                use: new SESV2({ region: config.ses.region})
            }
        ];
    }
}
