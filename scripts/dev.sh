#!/bin/bash

# Authenticate with AWS via Okta
echo "Authenticating with AWS..."
eval $(aws-okta-processor authenticate -e --user $USER -k muse)

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "AWS authentication failed"
  exit 1
fi

echo "AWS credentials set"

# Export for child processes (turbo)
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN

# Run all dev servers
cd "$(dirname "$0")/.."
turbo dev
