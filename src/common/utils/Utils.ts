import { getConnectionManager, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { KeyValueMap } from '../interfaces/KeyValueMap';
import { ValidationResult } from '../validation/ValidationResult';

export class Utils {
  /**
   * Split an array into the chunks for given size
   * @param array
   * @param size
   */
  static chunk<T>(array: Array<T>, size: number): Array<Array<T>> {
    const chunks: Array<Array<T>> = [];
    let index = 0;
    while (index < array.length) {
      chunks.push(array.slice(index, size + index));
      index += size;
    }
    return chunks;
  }

  static async queryInReadCommittedTransaction<RESULT>(
    lambda: (queryRunner: QueryRunner) => Promise<RESULT | ValidationResult>
  ): Promise<RESULT | ValidationResult> {
    return this.queryInTransaction('READ COMMITTED', lambda);
  }

  static async queryInTransaction<RESULT>(
    isolationLevel: IsolationLevel,
    lambda: (queryRunner: QueryRunner) => Promise<RESULT | ValidationResult>
  ): Promise<RESULT | ValidationResult> {
    const queryRunner = getConnectionManager().get().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);
    try {
      const res = await lambda(queryRunner);
      if (res instanceof ValidationResult && res.hasViolations) {
        await queryRunner.rollbackTransaction();
      } else {
        await queryRunner.commitTransaction();
      }
      return Promise.resolve(res);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return Promise.reject(e);
    } finally {
      await queryRunner.release();
    }
  }


  // tslint:disable-next-line:cyclomatic-complexity
  public static diff(oldState: KeyValueMap, newState: KeyValueMap) {
    const result: any = {};
    if (Object.is(oldState, newState)) {
      return undefined;
    }
    if (!newState || typeof newState !== 'object') {
      return newState;
    }
    const keys = new Set(Object.keys(oldState || {}).concat(Object.keys(newState || {})));
    keys.forEach((key) => {
      if (newState[key] !== oldState[key] && !Object.is(oldState[key], newState[key])) {
        result[key] = newState[key];
      }
      if (typeof newState[key] === 'object' && typeof oldState[key] === 'object') {
        const value = this.diff(oldState[key], newState[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      }
    });
    return this.removeEmptyNodesInsideOut(result);
  }

  public static removeEmptyNodesInsideOut(obj: KeyValueMap) {
    if (typeof obj !== 'object') {
      return obj;
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        this.removeEmptyNodesInsideOut(obj[key]);
        if (Object.keys(obj[key] || {}).length === 0) {
          delete obj[key];
        }
      }
    }
    return obj;
  }

  public static unwrapObject(obj: KeyValueMap) {
    return Object.values(obj)[0];
  }

}
