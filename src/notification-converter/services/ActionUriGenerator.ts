import { NotificationConverterConfig } from '../../common/config/config';
import { KeyValueMap } from '../../common/interfaces/KeyValueMap';
import { CASE_INSENSITIVE_MAPPER, KeyValue, PlaceholderParser } from '../../common/utils/PlaceholderParser';
import { QueryUtils } from './QueryUtils';

export interface GeneratedUrl {
  actionUrl: string;
  userProfileLink: string;
}

export class ActionUriGenerator {
  public static USER_PROFILE_LINK = 'https://{{tenantSlug}}.{{domain}}.io/settings/profile-settings/email-notifications';

  constructor(private readonly event: KeyValueMap, private readonly config: NotificationConverterConfig) {}

  public async generate(url: string): Promise<GeneratedUrl> {
    // tenantSlug is missing in Tenant interface
    const tenantDetails = await QueryUtils.queryTable<KeyValueMap>(
      `select *
       from tenant.tenant
       where "tenantUri" = $1`,
      this.event.tenentUri || Object.keys(this.event.translations.TENANT)
    );
    const tenantSlug = tenantDetails.tenantSlug;
    const currentStage = this.config.environment;
    const parser = new PlaceholderParser(
      Object.assign(this.event, { tenantSlug, domain: this.config.domain, currentStage }) as KeyValue,
      CASE_INSENSITIVE_MAPPER
    );
    const actionUrl = parser.parse(url) as string;
    const userProfileLink = parser.parse(ActionUriGenerator.USER_PROFILE_LINK) as string;

    return { actionUrl, userProfileLink };
  }
}
