// @ts-expect-error gd-auth-client has no type definitions
import { IamTokenClient } from "gd-auth-client";

const SSO_HOST = "sso.dev-godaddy.com";
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getIamJwt(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const client = new IamTokenClient(SSO_HOST);
  const token = await client.getToken() as string;
  cachedToken = token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;

  return token;
}

export function clearIamJwtCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}
