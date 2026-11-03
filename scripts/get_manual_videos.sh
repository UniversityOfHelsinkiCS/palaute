#!/bin/bash

# Copies the newest manual videos recorded on master and their index files to public/manual

ARTIFACT=registry.version.helsinki.fi/toska/openshift/kontit/norppa-manual-videos:latest

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
TARGET=$PROJECT_ROOT/public/manual
PULLED=$(mktemp -d)
trap 'rm -rf "$PULLED"' EXIT

echo "Pulling $ARTIFACT"
if ! oras pull "$ARTIFACT" -o "$PULLED"; then
  echo ""
  echo "!! Could not pull the videos !!"
  echo "Log in first: oras login registry.version.helsinki.fi"
  echo ""
  exit 1
fi

SHA=$(oras manifest fetch "$ARTIFACT" | jq -r '.annotations["org.opencontainers.image.revision"]')
echo "Recorded from $SHA"

echo "Replacing $TARGET"
rm -rf "$TARGET"
mv "$PULLED/manual" "$TARGET"

ls "$TARGET"/*
