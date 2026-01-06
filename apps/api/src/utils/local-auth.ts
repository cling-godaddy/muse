import { spawnSync } from "child_process";

const NAME = "muse";

export async function authenticate() {
  const user = process.platform === "win32" ? process.env.USERNAME : process.env.USER;
  if (!user) throw new Error("Could not determine username");
  const child = spawnSync("aws-okta-processor", ["authenticate", "--key", NAME, "--user", user]);
  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }
  const output = JSON.parse(child.stdout.toString());
  process.env.AWS_ACCESS_KEY_ID = output.AccessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = output.SecretAccessKey;
  process.env.AWS_SESSION_TOKEN = output.SessionToken;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log("AWS credentials set");
}
