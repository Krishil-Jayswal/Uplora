#! /bin/sh

APP_NAME=$1

if [ -z "APP_NAME" ]; then
    echo "No app name provided"
    exit 1
fi

echo "Checking if '$APP_NAME' can be ignored..."

set +e
npx turbo-ignore "$APP_NAME"
EXIT_CODE=$?
set -e

echo "Ignore check exited with exit code $EXIT_CODE"

echo "code=$EXIT_CODE" >> "$GITHUB_OUTPUT"