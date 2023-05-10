import { InjectDependencies, Logger } from '@itonics/core';
import { TemplateNotFoundError } from '../../../common/utils/exceptions/TemplateNotFoundError';
import { NotificationTemplate, NotificationTemplateFetcherService } from '../NotificationTemplateFetcherService';

@InjectDependencies
export class InMemoryNotificationTemplateFetcherService implements NotificationTemplateFetcherService {
  constructor(private readonly logger: Logger) {}

  private readonly notificationsTemplates: Array<NotificationTemplate> = [
    {
      name: 'On/User/Element/ELEMENT_PUBLISHED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_PUBLISHED',
      templates: {
        en: {
          subject: '{{user.firstname}} {{user.lastname}} published your {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} published your {{element.type}} {{element.title}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        },
        fr: {
          subject: '{{user.firstname}} {{user.lastname}} a publié votre {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} a publié votre {{element.type}} {{element.title}}.',
          bodyText: 'Votre {{element.type}} {{element.title}} a été publié par {{user.firstname}} {{user.lastname}}.',
          ctaButtons: [this.getElementCtaButton(`Voir l'élément`)]
        },
        de: {
          subject: '{{user.firstname}} {{user.lastname}} hat Ihr {{element.type}} {{element.title}} veröffentlicht',
          bodyHeading: '{{user.firstname}} {{user.lastname}} hat Ihr {{element.type}} {{element.title}} veröffentlicht.',
          bodyText: 'Ihr {{element.type}} {{element.title}} wurde veröffentlicht von {{user.firstname}} {{user.lastname}}.',
          ctaButtons: [this.getElementCtaButton('Sehen Sie sich das Element an')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_UPDATED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_UPDATED',
      templates: {
        en: {
          subject: 'Your {{element.type}} {{element.title}} was edited',
          bodyHeading: 'Your {{element.type}} {{element.title}} was edited by {{user.firstname}} {{user.lastname}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_ARCHIVED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_ARCHIVED',
      templates: {
        en: {
          subject: '{{user.firstname}} {{user.lastname}} archived your {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} archived your {{element.type}} {{element.title}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View archived Element')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_RATED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_RATED',
      templates: {
        en: {
          subject: 'Element Rated',
          bodyHeading: 'Your {{element.type}} {{element.title}} was rated by  {{user.firstname}} {{user.lastname}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_CHILD_CREATED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_CHILD_CREATED',
      templates: {
        en: {
          subject: 'New Element was submitted',
          bodyHeading: '{{user.firstname}} {{user.lastname}} submitted a {{element.type}} {{element.title}} to {{parentElement.type}} {{parentElement.title}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_PHASE_CHANGE',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_PHASE_CHANGE',
      templates: {
        en: {
          subject: 'Element changed phase',
          bodyHeading: '{{element.type}} {{element.title}} changed phase from {{phases.from}} to {{phases.to}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_REJECTED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_REJECTED',
      templates: {
        en: {
          subject: 'Element rejected',
          bodyHeading: 'Your {{element.type}} {{element.title}} was rejected by {{user.firstname}} {{user.lastname}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Element/ELEMENT_REVIVED',
      triggerType: 'User',
      category: 'Element',
      action: 'ELEMENT_REVIVED',
      templates: {
        en: {
          subject: 'Element revived',
          bodyHeading: 'Your {{element.type}} {{element.title}} was revived by {{user.firstname}} {{user.lastname}}.',
          bodyText: '',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Comment/COMMENT_CREATED',
      triggerType: 'User',
      category: 'Comment',
      action: 'COMMENT_CREATED',
      templates: {
        en: {
          subject: '{{user.firstname}} {{user.lastname}} commented on your {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} commented on your {{element.type}} {{element.title}}.',
          bodyText: this.getCommentBody(),
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Comment/COMMENT_REPLY',
      triggerType: 'User',
      category: 'Comment',
      action: 'COMMENT_REPLY',
      templates: {
        en: {
          subject: '{{user.firstname}} {{user.lastname}} replied to you in {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} replied to you in {{element.type}} {{element.title}}.',
          bodyText: this.getCommentBody(),
          ctaButtons: [this.getElementCtaButton('View the Element')]
        }
      }
    },
    {
      name: 'On/User/Comment/COMMENT_MENTION',
      triggerType: 'User',
      category: 'Comment',
      action: 'COMMENT_MENTION',
      templates: {
        en: {
          subject: '{{user.firstname}} {{user.lastname}} mentioned you in {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} mentioned you in {{element.type}} {{element.title}}.',
          bodyText: this.getCommentBody(),
          ctaButtons: [this.getElementCtaButton('View the Element')]
        },
        fr: {
          subject: '{{user.firstname}} {{user.lastname}} vous a mentionné dans {{element.type}} {{element.title}}',
          bodyHeading: '{{user.firstname}} {{user.lastname}} vous a mentionné dans {{element.type}} {{element.title}}.',
          bodyText: '{{ comment.content }}',
          ctaButtons: [this.getElementCtaButton(`Voir le commentaire`)]
        },
        de: {
          subject: '{{user.firstname}} {{user.lastname}} hat Sie in {{element.type}} {{element.title}} erwähnt',
          bodyHeading: '{{user.firstname}} {{user.lastname}} hat Sie in {{element.type}} {{element.title}} erwähnt.',
          bodyText: '{{ comment.content }}',
          ctaButtons: [this.getElementCtaButton('Kommentar ansehen')]
        }
      }
    },
    {
      name: 'On/User/Element/FieldValueChanges',
      triggerType: 'User',
      category: 'Element',
      action: 'FieldValueChanges',
      templates: {
        en: {
          subject: 'You were assigned as {{fieldName}} to an element',
          bodyHeading: 'New Assignment',
          bodyText: 'You were assigned as {{fieldName}} for the  {{ element.type }} {{element.title}}.',
          ctaButtons: [this.getElementCtaButton('View the Element')]
        },
        fr: {
          subject: 'Vous avez été affecté en tant que {{fieldName}} à un élément',
          bodyHeading: 'Nouvelle affectation',
          bodyText: 'Vous avez été affecté en tant que {{fieldName }} pour le {{ element.type }} {{element.title}}.',
          ctaButtons: [this.getElementCtaButton(`Afficher l'élément`)]
        },
        de: {
          subject: 'Sie wurden einem Element als {{fieldName}} zugewiesen',
          bodyHeading: 'Neue Zuordnung',
          bodyText: 'Sie wurden als {{ fieldName }} für {{ element.type }} {{element.title}} zugewiesen.',
          ctaButtons: [this.getElementCtaButton('Zeigen Sie das Element an')]
        }
      }
    }
  ];

  private getCommentBody() {
    return '{{ comment.content }}';
  }

  private getElementCtaButton(text: string) {
    return {
      action: '{{actionUrl}}',
      name: 'positive',
      text
    };
  }

  public async getTemplate(triggerType: string, category: string, action: string): Promise<NotificationTemplate> {
    function titleCase(str: string) {
      return str[0].toUpperCase() + str.substr(1);
    }

    const name = `On/${titleCase(triggerType)}/${titleCase(category)}/${action.toUpperCase()}`.toLowerCase();
    const template = this.notificationsTemplates.find((tpl) => tpl.name.toLowerCase() === name);
    if (!template) {
      throw new TemplateNotFoundError(name);
    }
    return template;
  }
}
