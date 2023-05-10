import { RawEventDataSource, S3RawEventDataSource, S3Service, S3ServiceImpl } from '@itonics/audit-client';
import { DynamoDbService } from '@itonics/aws';
import { ServiceProvider, ServiceRegistration } from '@itonics/core';
import { S3 } from 'aws-sdk';
import { getCustomRepository } from 'typeorm';
import { MailService } from '../aws/ses/MailService';
import { SESMailService } from '../aws/ses/SESMailService';
import { SqsService } from '../aws/sqs/SqsService';
import { UserPreferencesRepository } from '../repositories/UserPreferencesRepository';
import { EmailBlacklistService } from '../services/EmailBlackListService';
import { UserPreferencesService } from '../services/UserPreferencesService';
import { UserPreferencesServiceImpl } from '../services/UserPreferencesServiceImpl';

export class CommonServiceProviders implements ServiceProvider {
  registers(): Array<ServiceRegistration> {
    return [
      {
        provide: S3,
        use: S3
      },
      {
        provide: S3Service,
        use: S3ServiceImpl
      },
      {
        provide: RawEventDataSource,
        use: S3RawEventDataSource
      },
      {
        provide: DynamoDbService,
        use: DynamoDbService
      },
      {
        provide: SqsService,
        use: SqsService
      },
      {
        provide: MailService,
        use: SESMailService
      },
      {
        provide: EmailBlacklistService,
        use: EmailBlacklistService
      },
      {
        provide: UserPreferencesService,
        use: UserPreferencesServiceImpl
      },
      {
        provide: UserPreferencesRepository,
        factory() {
          return getCustomRepository(UserPreferencesRepository);
        }
      }
    ];
  }
}
