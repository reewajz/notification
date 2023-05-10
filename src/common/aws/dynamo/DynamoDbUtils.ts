import { DynamoDbService } from '@itonics/aws';
import { ExpressionAttributeNameMap, ScanInput } from 'aws-sdk/clients/dynamodb';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
import { CompositeKeyWithValue } from '../../interfaces/CompositeKeyWithValue';
import { Results } from '../../interfaces/Results';
import ExpressionAttributeValueMap = DocumentClient.ExpressionAttributeValueMap;
import QueryInput = DocumentClient.QueryInput;

export interface QueryParams {
  tableName: string;
  indexName: string;
  keyConditionExpression?: string;
  filterExpression?: string;
  filterAttributeValues?: DocumentClient.ExpressionAttributeValueMap;
  hashKeyValue: string;
  hashKey: string;
  sortBySortKey?: boolean;
  paginationCursor: CompositeKeyWithValue;
  dynamoDbService: DynamoDbService;
  expressionAttributeNames?: ExpressionAttributeNameMap;
  select?: string;
  limit?: number;
  consistentRead?: boolean;
}

export interface FilterParams {
  filterExpression: string;
  expressionAttributeValues: ExpressionAttributeValueMap;
  keyConditionExpression?: string;
  expressionAttributeNames?: ExpressionAttributeNameMap;
}

export class DynamoDbUtils {
  /**
   * Query data using the Global Secondary Index(GSI)
   *  todo move this to core DynamoDbService
   * @param queryParams
   */
  public static getBySecondaryIndexKey<T>(queryParams: QueryParams): Promise<Results<T>> {
    return DynamoDbUtils.queryTable(queryParams).then((data) => {
      return {
        items: data.Items.map((item) => item as T),
        paginationCursor: data.LastEvaluatedKey,
        total: data.Count
      };
    });
  }

  /**
   * Scan dynamo db table
   *  todo move this to core DynamoDbService
   * @param dynamoDbService
   * @param tableName
   * @param paginationCursor
   * @param limit
   * @param filterExpression
   * @param expressionAttributeValues
   * @param expressionAttributeNames
   * @param indexName
   * @param consistentRead
   */
  public static scan<T>(
    dynamoDbService: DynamoDbService,
    tableName: string,
    paginationCursor?: CompositeKeyWithValue,
    limit: number = 10,
    filterExpression?: string,
    expressionAttributeValues?: ExpressionAttributeValueMap,
    expressionAttributeNames?: ExpressionAttributeNameMap,
    indexName?: string,
    consistentRead?: boolean
  ): Promise<Results<T>> {
    return DynamoDbUtils.scanTable(
      tableName,
      paginationCursor,
      filterExpression,
      expressionAttributeValues,
      indexName,
      dynamoDbService,
      limit,
      expressionAttributeNames,
      null,
      consistentRead
    ).then((data) => {
      return {
        items: data.Items.map((item) => item as T),
        paginationCursor: data.LastEvaluatedKey
      };
    });
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private static queryTable(queryParams: QueryParams): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> {
    const params: QueryInput = {
      IndexName: queryParams.indexName,
      TableName: queryParams.tableName,
      KeyConditionExpression: queryParams.keyConditionExpression
        ? `#hashKey = :hashKeyValue` + ' AND ' + queryParams.keyConditionExpression
        : `#hashKey = :hashKeyValue`,
      ScanIndexForward: queryParams.sortBySortKey,
      ExpressionAttributeValues: {},
      ExpressionAttributeNames: queryParams.expressionAttributeNames ? queryParams.expressionAttributeNames : {}
    };

    if (queryParams.consistentRead) {
      params.ConsistentRead = true;
    }

    if (queryParams.limit) {
      params.Limit = queryParams.limit;
    }
    if (queryParams.select) {
      params.Select = queryParams.select;
    }
    if (queryParams.filterExpression) {
      params.FilterExpression = queryParams.filterExpression;
    }

    if (queryParams.filterAttributeValues) {
      params.ExpressionAttributeValues = queryParams.filterAttributeValues;
    }

    params.ExpressionAttributeValues[':hashKeyValue'] = queryParams.hashKeyValue;
    params.ExpressionAttributeNames['#hashKey'] = queryParams.hashKey;

    if (queryParams.paginationCursor) {
      params.ExclusiveStartKey = queryParams.paginationCursor;
    }
    return queryParams.dynamoDbService.getDocumentClient().query(params).promise();
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private static scanTable(
    tableName: string,
    paginationCursor: CompositeKeyWithValue,
    filterExpression: string,
    expressionAttributeValues: DocumentClient.ExpressionAttributeValueMap,
    indexName: string,
    dynamoDbService: DynamoDbService,
    limit?: number,
    expressionAttributeNames?: ExpressionAttributeNameMap,
    select?: string,
    consistentRead?: boolean
  ): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> {
    const params: ScanInput = {
      TableName: tableName
    };

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (select) {
      params.Select = select;
    }

    if (limit) {
      params.Limit = limit;
    }

    if (paginationCursor) {
      params.ExclusiveStartKey = paginationCursor;
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }

    if (expressionAttributeValues) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    if (indexName) {
      params.IndexName = indexName;
    }

    if (consistentRead) {
      params.ConsistentRead = consistentRead;
    }

    return dynamoDbService.getDocumentClient().scan(params).promise();
  }
}
