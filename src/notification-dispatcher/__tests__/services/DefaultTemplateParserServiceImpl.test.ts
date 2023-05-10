import { ConsoleLogger } from '@itonics/core';
import { NotificationTemplateFetcherService } from '../../services/NotificationTemplateFetcherService';
import { TemplateParserService } from '../../services/TemplateParserService';
import { DefaultTemplateParserServiceImpl } from '../../services/impl/DefaultTemplateParserServiceImpl';
import { InMemoryNotificationTemplateFetcherService } from '../../services/impl/InMemoryNotificationTemplateFetcherService';

const logger = new ConsoleLogger();

describe('DefaultTemplateParserServiceImpl test', function () {
  const templateService: NotificationTemplateFetcherService = new InMemoryNotificationTemplateFetcherService(logger);
  const parserService: TemplateParserService = new DefaultTemplateParserServiceImpl(logger);

  it('should parse all the fields in the template', async function () {
    const { templates } = await templateService.getTemplate('User', 'Element', 'ELEMENT_PUBLISHED');
    const englishTemplate = templates['en'];
    const result = parserService.parse(englishTemplate, [
      {
        user: {
          firstname: 'Prashant',
          lastName: 'B'
        },
        element: {
          type: 'Ideation',
          title: 'Intro'
        }
      },
      {
        actionUrl: 'www.google.com'
      }
    ]);
    expect(result).toStrictEqual({
      subject: 'Prashant B published your Ideation Intro',
      bodyHeading: 'Prashant B published your Ideation Intro.',
      bodyText: '',
      ctaButtons: [
        {
          action: 'www.google.com',
          name: 'positive',
          text: 'View the Element'
        }
      ]
    });
  });

  it('should parse all the fields for comments template', async function () {
    const { templates } = await templateService.getTemplate('User', 'COMMENT', 'COMMENT_CREATED');
    const englishTemplate = templates['en'];
    const result = parserService.parse(englishTemplate, [
      {
        user: {
          lastName: 'Shrestha',
          firstName: 'Reewaj'
        },
        comment: {
          content: 'tourism booming in nepal ?'
        },
        element: {
          type: 'Idea',
          title: 'tourism in nepal'
        },
        objectName: 'COMMENT'
      },
      {
        actionUrl: 'www.google.com'
      }
    ]);
    expect(result).toStrictEqual({
      bodyHeading: 'Reewaj Shrestha commented on your Idea tourism in nepal.',
      bodyText: 'tourism booming in nepal ?',
      ctaButtons: [
        {
          action: 'www.google.com',
          name: 'positive',
          text: 'View the Element'
        }
      ],
      subject: 'Reewaj Shrestha commented on your Idea tourism in nepal'
    });
  });
});
