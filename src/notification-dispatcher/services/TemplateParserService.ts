import { KeyValue } from '../../common/utils/PlaceholderParser';
import { Template } from './NotificationTemplateFetcherService';


export abstract class TemplateParserService {
  /**
   * Replaces the placeholder in {@link template} with the values in {@link variables}
   * @param template object containing string value with placeholders denoted by "{{' and '}}".
   * @param variables The values to replace the placeholder with
   */
  abstract parse(template: Template, variables: Array<KeyValue>): Template;
}
