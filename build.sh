#!/bin/sh

# Set the VITE_APP_URL based on the Netlify build context
if [ "$CONTEXT" = "production" ]; then
  echo "Build context: production. Using canonical URL."
  export VITE_APP_URL="$URL"
else
  echo "Build context: $CONTEXT. Using prime deploy URL."
  export VITE_APP_URL="$DEPLOY_PRIME_URL"
fi

npm run vite:build