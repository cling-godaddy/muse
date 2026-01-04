import {
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Site } from "@muse/core";
import { getClient } from "../client";
import { TABLE_NAME } from "../table";

export interface SitesTable {
  save(site: Site): Promise<void>
  getById(id: string): Promise<Site | null>
  delete(id: string): Promise<void>
}

export function createSitesTable(): SitesTable {
  const client = getClient();

  return {
    async save(site: Site): Promise<void> {
      await client.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: site,
        }),
      );
    },

    async getById(id: string): Promise<Site | null> {
      const result = await client.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id },
        }),
      );
      return (result.Item as Site) ?? null;
    },

    async delete(id: string): Promise<void> {
      await client.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id },
        }),
      );
    },
  };
}
