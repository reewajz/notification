import { DynamoDbService } from '@itonics/aws';
import { getDefaultLogger } from '@itonics/core';
import { config, DynamoDB } from 'aws-sdk';
import { CreateTableInput, GlobalSecondaryIndex, LocalSecondaryIndex } from 'aws-sdk/clients/dynamodb';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface DynamoDbKey {
  partitionKeyName: string;
  partitionKeyType: string;
  sortKeyName?: string;
  sortKeyType?: string;
  ProjectionType?: string;
  NonKeyAttributes?: Array<string>;
}

export enum IndexType {
  local = 'local',
  global = 'global'
}

export class DynamoDbServiceTest extends DynamoDbService {
  private readonly docClient: DocumentClient;

  private readonly dynamoDb: DynamoDB;

  constructor(endpoint?: string) {
    super(getDefaultLogger());
    config.update({
      accessKeyId: 'xxxxxx',
      secretAccessKey: 'sdgSD'
    });
    endpoint = endpoint || 'http://localhost:8000';
    this.docClient = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', endpoint, region: 'local' });
    this.dynamoDb = new DynamoDB({ apiVersion: '2012-08-10', endpoint, region: 'local' });
  }

  getDocumentClient(): DocumentClient {
    return this.docClient;
  }

  getDynamoDb(): DynamoDB {
    return this.dynamoDb;
  }

  public async createTable(
    tableName: string,
    key: DynamoDbKey,
    globalIndexes?: Map<string, DynamoDbKey>,
    localIndexes?: Map<string, DynamoDbKey>
  ): Promise<void> {
    const params: CreateTableInput = {
      AttributeDefinitions: [{ AttributeName: key.partitionKeyName, AttributeType: key.partitionKeyType }],
      KeySchema: [{ AttributeName: key.partitionKeyName, KeyType: 'HASH' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: tableName
    };

    if (key.sortKeyName) {
      params.KeySchema.push({ AttributeName: key.sortKeyName, KeyType: 'RANGE' });
      params.AttributeDefinitions.push({ AttributeName: key.sortKeyName, AttributeType: key.sortKeyType });
    }
    if (globalIndexes) {
      params.GlobalSecondaryIndexes = [];
      this.buildSecondaryIndex(params, globalIndexes, IndexType.global);
    }

    if (localIndexes) {
      params.LocalSecondaryIndexes = [];
      this.buildSecondaryIndex(params, localIndexes, IndexType.local);
    }

    // unique attributes
    const flags = new Set();
    params.AttributeDefinitions = params.AttributeDefinitions.filter((entry) => {
      if (flags.has(entry.AttributeName)) {
        return false;
      }
      flags.add(entry.AttributeName);
      return true;
    });

    await this.getDynamoDb().createTable(params).promise();
  }

  public async deleteTable(tableName: string): Promise<void> {
    const params = {
      TableName: tableName
    };
    await this.getDynamoDb().deleteTable(params).promise();
  }

  private buildSecondaryIndex(params: CreateTableInput, indexes: Map<string, DynamoDbKey>, type: IndexType) {
    indexes.forEach((indexKey, indexName) => {
      const si: LocalSecondaryIndex | GlobalSecondaryIndex = {
        IndexName: indexName,
        KeySchema: [{ AttributeName: indexKey.partitionKeyName, KeyType: 'HASH' }],
        Projection: {
          ProjectionType: indexKey.hasOwnProperty('ProjectionType') ? indexKey.ProjectionType : 'ALL',
          NonKeyAttributes: indexKey.hasOwnProperty('NonKeyAttributes') ? indexKey.NonKeyAttributes : undefined
        },
        ProvisionedThroughput: params.ProvisionedThroughput
      };
      params.AttributeDefinitions.push({
        AttributeName: indexKey.partitionKeyName,
        AttributeType: indexKey.partitionKeyType
      });

      si.KeySchema.push({ AttributeName: indexKey.sortKeyName, KeyType: 'RANGE' });
      params.AttributeDefinitions.push({
        AttributeName: indexKey.sortKeyName,
        AttributeType: indexKey.sortKeyType
      });
      if (type === IndexType.global) {
        params.GlobalSecondaryIndexes.push(si);
      } else {
        delete si.ProvisionedThroughput; // ProvisionedThroughput not required in LocalSecondaryIndexes
        params.LocalSecondaryIndexes.push(si);
      }
    });
  }
}
