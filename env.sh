#!/bin/sh
set -x

ENV_FILE="/usr/share/nginx/html/env.js"

echo "Running env replacement..."
echo "API_BASE_URL=$API_BASE_URL"

if [ -f "$ENV_FILE" ]; then
  sed -i "s|__API_BASE_URL__|${API_BASE_URL:-http://localhost:5000}|g" "$ENV_FILE"
  echo "env.js updated successfully"
else
  echo "env.js not found, skipping replacement"
fi
