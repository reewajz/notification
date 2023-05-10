import { KeyValueMap } from '../interfaces/KeyValueMap';

export class JsonWalker {
  constructor(private readonly obj: KeyValueMap) {}

  walk(keys: Array<string>) {
    return this.walkTill(
      keys,
      () => false // walk till the end
    );
  }

  public collectValuesAtPath(guider: JsonWalker): Array<KeyValueMap> {
    function _collect(walker: JsonWalker, guider_: JsonWalker, collector_: Array<KeyValueMap>) {
      const guideObj = guider_.obj;
      if (typeof guideObj !== 'object' && typeof guideObj !== 'function') {
        return;
      }
      const key2 = Object.keys(guideObj).find((it) => it !== 'updatedOn' && it !== 'version');
      const key1 = Object.keys(walker.obj).find((it) => it === key2);
      // @ts-ignore
      const objElement = walker.obj[key1] as KeyValueMap;
      collector_.push(objElement);
      _collect(new JsonWalker(objElement), new JsonWalker(guider_.obj[key2] as KeyValueMap), collector_);
    }

    const collector: Array<KeyValueMap> = [];
    _collect(this, guider, collector);
    return collector;
  }

  walkTill(keys: Array<string>, predicate: (prev: KeyValueMap, key: string, current: KeyValueMap) => boolean) {
    let json = this.obj;
    for (const key of keys) {
      const next = json[key];
      if (predicate(json, key, next) === true) {
        return next;
      }
      if (next == null) {
        return undefined;
      }
      json = next;
    }
    return json;
  }

  canWalk(keys: Array<string>): boolean {
    let json = this.obj;
    for (const key of keys) {
      if (!(key in json)) {
        return false;
      }
      json = json[key];
    }
    return true;
  }
}
