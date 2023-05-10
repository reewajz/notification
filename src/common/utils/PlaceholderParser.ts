import { MissingVariablePlaceholderError } from './MissingVariablePlaceholderError';

export interface KeyValue {
  [key: string]: KeyValue | string | number;
}

interface RegexMatch {
  /**
   * contains entire matches including the {{ and }}
   */
  fullMatch: string;
  /**
   * contains the object construct e.g.: a.b.c
   */
  innerMatch: string;

  startIndex: number;

  defaultValue?: string;
}

export type KeyMapper = (key: string) => string;
export const NOOP_MAPPER: KeyMapper = (key: string) => key;
export const CASE_INSENSITIVE_MAPPER: KeyMapper = (key: string) => key.toLowerCase();

/**
 * Substitutes placeholder denoted by `{{` and `}}` with the loaded variables.
 *
 * Also supports default value using `?: "<default value>"`
 *
 * eg `{{ a.b.c.d ?: "default" }}` will substitute `a.b.c.d` with given variable if provided else will use the default value
 */
export class PlaceholderParser {
  /**
   *
   * @param variables the variables which are used for substitution in placeholder
   * @param keyMapperFn is applied to keys in the variables and placeholders
   *
   * @see {@link parse}
   */
  public constructor(
    private readonly variables: Array<KeyValue> | KeyValue,
    private readonly keyMapperFn: (value: string) => string = NOOP_MAPPER
  ) {
    if (Array.isArray(variables)) {
      this.loadVars(variables);
    } else {
      this.loadVar(variables);
    }
  }

  private readonly _variables = new Map<string, string | number>();

  private static extractPlaceholders(str: string): Array<RegexMatch> {
    // matches {{<whitespaces>a.b.c<whitespaces> ?: "default value" }}
    // "?:" is the non-capturing group
    // ".*?" is the lazy match
    const regexMatchingPlaceholder = new RegExp(`{{\\s*(\\w+(?:.\\w+)*)\\s*(?:\\?:\\s*"(.*?)")?\\s*}}`, 'g');
    let match = regexMatchingPlaceholder.exec(str);
    const result: Array<RegexMatch> = [];
    while (match != null) {
      result.push({
        fullMatch: match[0],
        innerMatch: match[1], // first match contains complete path to be substituted
        startIndex: match.index,
        defaultValue: match?.[2] // default value match is at group 2
      });
      match = regexMatchingPlaceholder.exec(str);
    }
    return result;
  }

  private loadVar(variable: KeyValue): PlaceholderParser {
    this.flatten(variable).forEach((value, key) => {
      this._variables.set(this.keyMapperFn(key), value); // apply the mapper before setting
    });
    return this;
  }

  private loadVars(variables: Array<KeyValue>): PlaceholderParser {
    variables.forEach(this.loadVar.bind(this));
    return this;
  }

  private flatten(obj: KeyValue): Map<string, string | number> {
    const result = new Map<string, string | number>();

    function _flatten(obj_: KeyValue | string | number, key: string = '') {
      if (!!obj_) {
        if (typeof obj_ === 'string' || typeof obj_ === 'number') {
          result.set(key, obj_ as string);
        } else {
          Object.keys(obj_).forEach((k) => {
            _flatten(obj_[k], key ? `${key}.${k}` : k);
          });
        }
      }
    }

    _flatten(obj);
    return result;
  }

  /**
   * Substitute the placeholder in {@link template} with the loaded variables {@link variables}
   *
   * @throws {@link MissingVariablePlaceholderError} if not all placeholders can be substituted or if the placeholder has no default value
   */
  public parse(template: string): string | MissingVariablePlaceholderError {
    const matches = PlaceholderParser.extractPlaceholders(template);
    let result = template;
    const missingVars: Array<string> = [];
    matches.forEach((match) => {
      const placeHolderValue = this.keyMapperFn(match.innerMatch); // use the same preprocessor as used in the variables
      if (!this._variables.has(placeHolderValue) && !match.defaultValue) {
        missingVars.push(match.innerMatch);
      } else {
        result = result.replace(match.fullMatch, this._variables.get(placeHolderValue)?.toString() || match.defaultValue);
      }
    });
    if (missingVars.length > 0) {
      // has missing _variables
      throw new MissingVariablePlaceholderError(missingVars);
    }
    return result;
  }
}
