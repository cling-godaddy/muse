#!/bin/bash

# Authenticate with AWS via Okta
echo "Authenticating with AWS..."
eval $(aws-okta-processor authenticate -e --user $USER -k muse)

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "AWS authentication failed"
  exit 1
fi

echo "AWS credentials set"

# Run all dev servers
cd "$(dirname "$0")/.."
turbo dev
