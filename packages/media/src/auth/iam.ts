// @ts-expect-error gd-auth-client has no type definitions
import { IamTokenClient } from "gd-auth-client";
import { fromEnv } from "@aws-sdk/credential-provider-env";

const SSO_HOST = "sso.dev-godaddy.com";
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getIamJwt(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  // explicitly use env credentials (from Okta) to avoid conflict with AWS_PROFILE
  const client = new IamTokenClient(SSO_HOST, {
    credentialProviderChain: fromEnv(),
  });
  const token = await client.getToken() as string;
  cachedToken = token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;

  return token;
}

export function clearIamJwtCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}
