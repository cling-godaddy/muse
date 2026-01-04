import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let _client: DynamoDBDocumentClient | null = null;

export function getClient(): DynamoDBDocumentClient {
  if (!_client) {
    const region = process.env.AWS_REGION ?? "us-east-2";
    const ddb = new DynamoDBClient({ region });
    _client = DynamoDBDocumentClient.from(ddb, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }
  return _client;
}
