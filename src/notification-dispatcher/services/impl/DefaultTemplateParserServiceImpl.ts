import { InjectDependencies, Logger } from '@itonics/core';
import { CASE_INSENSITIVE_MAPPER, KeyValue, PlaceholderParser } from '../../../common/utils/PlaceholderParser';
import { Template } from '../NotificationTemplateFetcherService';
import { TemplateParserService } from '../TemplateParserService';

/**
 * Uses {@link PlaceholderParser} to substitute the placeholders
 */
@InjectDependencies
export class DefaultTemplateParserServiceImpl implements TemplateParserService {
  constructor(private logger: Logger) {
  }

  private static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  /**
   * @param template template containing placeholders; it is mutated
   * @param parser
   * @private
   */
  private recursivelyParse(template: Record<string, any>, parser: PlaceholderParser) {
    for (const key in template) {
      if (!(key in template)) {
        continue;
      }
      const value = template[key];
      if (typeof value === 'string') {
        template[key] = parser.parse(template[key]);
      } else if (Array.isArray(value)) {
        value.forEach((val) => {
          this.recursivelyParse(val, parser);
        });
      } else {
        this.recursivelyParse(value, parser);
      }
    }
  }

  /**
   * Uses {@link PlaceholderParser} to substitute all the fields containing the placeholders in
   * {@link template} with the values in {@link variables}
   */
  public parse(template: Template, variables: Array<KeyValue>): Template {
    const parser = new PlaceholderParser(variables, CASE_INSENSITIVE_MAPPER);
    const clone = DefaultTemplateParserServiceImpl.clone(template);
    try {
      this.recursivelyParse(clone, parser);
    } catch (e) {
      this.logger.error(`DefaultTemplateParserServiceImpl: Parser error`, {
        original: template,
        variables,
        error: e?.message
      });
      throw  e;
    }
    this.logger.debug('DefaultTemplateParserServiceImpl: Parse result', {
      original: template,
      result: clone,
      variables
    });
    return clone;
  }

}
