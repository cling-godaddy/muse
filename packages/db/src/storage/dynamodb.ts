import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Storage } from "./types";

export function createDynamoDBStorage(): Storage {
  const region = process.env.AWS_REGION ?? "us-east-2";
  const ddb = new DynamoDBClient({ region });
  const client = DynamoDBDocumentClient.from(ddb, {
    marshallOptions: { removeUndefinedValues: true },
  });

  return {
    async get<T>(table: string, key: Record<string, string>): Promise<T | null> {
      const result = await client.send(
        new GetCommand({ TableName: table, Key: key }),
      );
      return (result.Item as T) ?? null;
    },

    async put(table: string, item: unknown): Promise<void> {
      await client.send(
        new PutCommand({ TableName: table, Item: item as Record<string, unknown> }),
      );
    },

    async delete(table: string, key: Record<string, string>): Promise<void> {
      await client.send(
        new DeleteCommand({ TableName: table, Key: key }),
      );
    },
  };
}
