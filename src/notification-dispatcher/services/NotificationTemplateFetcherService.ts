export interface NotificationTemplate {
  name: string;
  triggerType: string;
  category: string;
  action: string;
  templates: { [lang: string]: Template };
}

export interface Template {
  subject: string;
  bodyHeading: string;
  bodyText?: string;
  ctaButtons: Array<CtaButton>;
  userProfileUrl?: string;
}

export interface CtaButton {
  name: string;
  text: string;
  action: string;
}

export abstract class NotificationTemplateFetcherService {
  abstract getTemplate(triggerType: string, category: string, action: string): Promise<NotificationTemplate>;
}
