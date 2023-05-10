import { AuditEvent, AuditEventBase, RawEventDataSource, S3RawEventParams } from '@itonics/audit-client';
import { Inject, InjectDependencies, Logger } from '@itonics/core';
import { User } from '@itonics/core/dist/types/tenant/model';
import { FeatureFlagClient } from '@itonics/features';
import { NotificationConverterConfig } from '../../common/config/config';
import { KeyValueMap } from '../../common/interfaces/KeyValueMap';
import { UserPreferences } from '../../common/interfaces/UserPreferences';
import { UserPreferencesService } from '../../common/services/UserPreferencesService';
import { InCorrectPathException } from '../../common/utils/exceptions/InCorrectPathException';
import { Audience } from '../interfaces/Audience';
import { NotificationBuffer, NotificationStatus } from '../interfaces/NotificationBuffer';
import { SourceType } from '../interfaces/NotificationCategories';
import { NotificationEventConfig } from '../interfaces/NotificationEventConfig';
import { NotificationConfig } from '../lambda/tokens';
import { ActionUriGenerator } from './ActionUriGenerator';
import { PreProcessorFactory } from './AuditLogsPreprocessor/PreProcessorFactory';
import { NotificationBufferService } from './NotificationBufferService';
import { NotificationEventConfigService } from './NotificationEventConfigService';
import { NotificationEventConverter } from './NotificationEventConverter';
import { QueryUtils } from './QueryUtils';

interface ExistsResponse {
  exists: boolean;
}

@InjectDependencies
export class NotificationEventConverterImpl implements NotificationEventConverter {
  public static readonly ignoredTypes: Array<SourceType> = [SourceType.TENANT, SourceType.USER];

  constructor(
    private readonly rawEventDataSource: RawEventDataSource<S3RawEventParams>,
    private readonly notificationEventConfigService: NotificationEventConfigService,
    private readonly notificationBufferService: NotificationBufferService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly featureFlagClient: FeatureFlagClient,
    @Inject(NotificationConfig) private readonly config: NotificationConverterConfig,
    private readonly logger: Logger
  ) {}

  public async transform(auditEventBase: AuditEventBase): Promise<NotificationBuffer> {
    if (NotificationEventConverterImpl.ignoredTypes.includes(auditEventBase.sourceType)) {
      return;
    }

    const auditEvent = await this.getObjectFromS3(auditEventBase.key);
    this.logger.info('raw object from s3:', auditEvent);

    const tenantUri = this.getTenantUri(auditEvent);

    // some audit event might not have tenant uri, so we are excluding such events
    if (!tenantUri) {
      return;
    }
    const notificationAllowed = await this.featureFlagClient.isFeatureEnabledInTenant(tenantUri, 'emailsend.lambda.notification');

    if (notificationAllowed) {
      const notificationBuffer = await this.convert(auditEvent);


      if (notificationBuffer) {
        const userPreferences = await this.userPreferencesService.create(notificationBuffer.userPreferences[0]);
        notificationBuffer.userPreferences = [userPreferences];
        notificationBuffer.status = NotificationStatus.waitingForAggregation;
        return await this.notificationBufferService.create(notificationBuffer);
      }
    } else {
      this.logger.info('Feature Flagged', tenantUri);
      return null;
    }
  }

  ///////////////////////
  private async getObjectFromS3(key: string) {
    const params: S3RawEventParams = {
      bucket: this.config.bucket.name,
      key
    };
    return await this.rawEventDataSource.read(params);
  }

  private getTenantUri(auditEvent: AuditEvent): string | undefined {
    return Object.keys(auditEvent.translations?.['TENANT'] ?? {})?.[0];
  }

  private getSpaceUri(auditEvent: AuditEvent): string | undefined {
    return Object.keys(auditEvent.translations?.['SPACE'] ?? {})?.[0];
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private async convert(auditEvent: AuditEvent) {
    const source = this.getSourceType(auditEvent.subAction);

    const notificationConfig = await this.preProcessorAndGetNotificationConfig(auditEvent, source);
    if (!notificationConfig) {
      //  todo: return error ?
      this.logger.info('No config!!');
      return false;
    }

    const userDetails: User = await QueryUtils.queryTable<User>(`select * from tenant.user where "userUri" = $1`, [auditEvent.userUri]);

    this.logger.debug('userDetails::', userDetails);

    const subject = auditEvent[notificationConfig.subject];
    const predicate = notificationConfig.uri;
    const object = this.getNestedFieldsValue(auditEvent, notificationConfig.object) as string;
    const userPreferences = await this.getAllRecipient(auditEvent, notificationConfig);

    const tenantUri = this.getTenantUri(auditEvent);
    const spaceUri = this.getSpaceUri(auditEvent);
    const isActiveUserPresentInSpace: ExistsResponse = await this.isActiveUserPresentInSpace(spaceUri, userPreferences[0].uri);
    const isActiveUserPresentInTenant: ExistsResponse = await this.isActiveUserPresentInTenant(tenantUri, userPreferences[0].uri);
    this.logger.info(
      `tenant active status : ${JSON.stringify(isActiveUserPresentInTenant)}, space: ${JSON.stringify(isActiveUserPresentInSpace)}`
    );

    if (!isActiveUserPresentInSpace.exists || !isActiveUserPresentInTenant.exists) {
      return;
    }

    const sourceUri: KeyValueMap = {};

    if (auditEvent.sourceType === SourceType.SPACE) {
      sourceUri.spaceUri = auditEvent.sourceUri;
    }

    if (auditEvent.sourceType === SourceType.TENANT) {
      sourceUri.tenantUri = auditEvent.sourceUri;
    }

    // todo: fixme get the variables config from db?
    // for element objectName will be element name
    const variables: KeyValueMap = {
      user: { firstName: `${userDetails.firstName}`, lastName: `${userDetails.lastName}` },
      objectName: auditEvent.objectName
    };

    if (notificationConfig.variables) {
      const flattenFields = {};
      this.recursivelyExtractNestedFields(auditEvent.translations, flattenFields);
      const sourceVariables: KeyValueMap = {};
      Object.entries(notificationConfig.variables).forEach(([key, value]) => {
        // temp hack
        if (value.includes('translations')) {
          sourceVariables[key] = Object.values(this.getNestedFieldsValue(auditEvent, value))[0];
        } else {
          sourceVariables[key] = this.getNestedFieldsValue(auditEvent, value);
        }
      });
      variables[source.toLowerCase()] = sourceVariables;
    }
    // temp hack
    if (notificationConfig.preFetchVariables) {
      Object.entries(notificationConfig.preFetchVariables).forEach(([key, value]) => {
        variables[key] = value;
      });
    }
    this.logger.debug('variables::', variables);

    const actionUriGenerator: ActionUriGenerator = new ActionUriGenerator(auditEvent, this.config);

    const generatedUrl = await actionUriGenerator.generate(notificationConfig.actionUrl);
    variables['userProfileLink'] = generatedUrl.userProfileLink;

    // fixme: loop through recipient to make a notification buffer ?
    const notificationBuffer: NotificationBuffer = {
      subject,
      predicate,
      object,
      userPreferences,
      source,
      variables,
      actionUrl: generatedUrl.actionUrl,
      tenantUri,
      spaceUri
    };

    return Object.assign(notificationBuffer, sourceUri);
  }

  private async preProcessorAndGetNotificationConfig(auditEvent: AuditEvent, source: string): Promise<NotificationEventConfig> {
    const preProcessorFactory = new PreProcessorFactory(this.logger, this.notificationEventConfigService, this.config);
    const preProcessor = preProcessorFactory.create(source);
    if (!preProcessor) {
      return ;
    }
    return preProcessor.process(auditEvent, source);
  }

  private recursivelyExtractNestedFields(template: Record<string, any>, result: Record<string, any>) {
    for (const key in template) {
      if (!(key in template)) {
        continue;
      }
      const value = template[key];
      if (typeof value === 'string') {
        result[key] = template[key];
      } else if (Array.isArray(value)) {
        value.forEach((val) => {
          this.recursivelyExtractNestedFields(val, result);
        });
      } else {
        this.recursivelyExtractNestedFields(value, result);
      }
    }
  }

  private getNestedFieldsValue(auditEvent: AuditEvent, path: string): string | KeyValueMap {
    try {
      return path.split('.').reduce((acc: KeyValueMap, item: keyof AuditEvent) => {
        return acc[item];
      }, auditEvent);
    } catch (error) {
      throw new InCorrectPathException('Specified path is not correct!!');
    }
  }

  private async getAllRecipient(auditEvent: AuditEvent, notificationConfig: NotificationEventConfig): Promise<Array<UserPreferences>> {
    const userPreferences: Array<UserPreferences> = [];
    // fixme: we have hardcoded values for user preferences here
    if (notificationConfig.audience.includes(Audience.owner)) {
      const objectOwner = await this.getObjectOwner(auditEvent, notificationConfig);
      userPreferences.push(objectOwner);
    }
    if (notificationConfig.audience.includes(Audience.specificUser)) {
      const audiences = notificationConfig.preFetchVariables?.audiences?.map((user) => ({
        uri: user,
        language: 'en',
        notificationChannel: 'email',
        isNotificationEnable: true
      }));
      if (audiences) {
        userPreferences.push(...audiences);
      }
    }
    if (notificationConfig.audience.includes(Audience.elementOwner)) {
      const element = await this.getElementDetails(this.getNestedFieldsValue(auditEvent, notificationConfig.elementUriPath) as string);
      const ownerUri = element.createdByUri;
      userPreferences.push({ uri: ownerUri, language: 'en', notificationChannel: 'email', isNotificationEnable: true });
    }
    return userPreferences;
  }

  // todo get the notification recipient and its configs as well
  public async getObjectOwner(auditEvent: AuditEvent, config: NotificationEventConfig): Promise<UserPreferences> {
    const userUri = config.ownerUri
      ? config.ownerUri
      : config.ownerUriPath
      ? this.getNestedFieldsValue(auditEvent, config.ownerUriPath)
      : auditEvent.contexts.newState[auditEvent.type].createdByUri;

    return new Promise((resolve) => {
      resolve({
        uri: userUri,
        language: 'en',
        notificationChannel: 'email',
        isNotificationEnable: true
      });
    });
  }

  private getSourceType(subAction: string) {
    const splitType = subAction.split('_');
    return splitType[0] as SourceType;
  }

  private getElementDetails(elementId: string) {
    return QueryUtils.queryTable<KeyValueMap>(`select * from entity.entity where uri = $1`, [elementId]);
  }

  private async isActiveUserPresentInSpace(spaceUri: string, userUri: string): Promise<ExistsResponse> {
    if (spaceUri && userUri) {
      return await QueryUtils.queryTable<ExistsResponse>(
        `select exists (select 1 from permission.space_user where "spaceUri"=$1 AND "userUri" =$2 AND active=true)`,
        [spaceUri, userUri]
      );
    }
    return { exists: false };
  }

  private async isActiveUserPresentInTenant(tenantUri: string, userUri: string): Promise<ExistsResponse> {
    if (tenantUri && userUri) {
      return await QueryUtils.queryTable<ExistsResponse>(
        `select exists (select 1 from permission.tenant_user where "tenantTenantUri"=$1 AND "userUserUri" =$2 AND status = 'ACTIVATE')`,
        [tenantUri, userUri]
      );
    }
    return { exists: false };
  }
}
