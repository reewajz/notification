import { QueryRunner } from 'typeorm';
import { Utils } from '../../common/utils/Utils';

export class QueryUtils {
  public static queryTable<T>(query: string, parameters: Array<string>) {
    return Utils.queryInReadCommittedTransaction<T>(async (queryRunner: QueryRunner) => {
      return (await queryRunner.query(query, parameters))[0];
    }) as Promise<T>;
  }

  public static queryAll<T>(query: string, parameters: Array<Array<string>>) {
    return Utils.queryInReadCommittedTransaction<T>(async (queryRunner: QueryRunner) => {
      return (await queryRunner.query(query, parameters));
    }) as Promise<T>;
  }
}
