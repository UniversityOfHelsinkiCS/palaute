#!/bin/bash

# Copies the manual videos and index files from the production or staging image to public/manual

echo "Get the videos from:"
select TAG in production staging; do
  if [ -n "$TAG" ]; then
    echo "You selected: $TAG"
    break
  else
    echo "Invalid selection. Please select a valid number."
  fi
done
[ -z "$TAG" ] && exit 1

IMAGE=registry.version.helsinki.fi/toska/openshift/kontit/norppa:$TAG
CONTAINER=norppa_manual_videos

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
TARGET=$PROJECT_ROOT/public/manual

echo "Pulling $IMAGE"
if ! docker pull "$IMAGE"; then
  echo ""
  echo "!! Could not pull the image !!"
  echo "Log in first: docker login registry.version.helsinki.fi"
  echo ""
  exit 1
fi

docker rm -f $CONTAINER >/dev/null 2>&1
docker create --name $CONTAINER "$IMAGE" >/dev/null

rm -rf "$TARGET.new"
if ! docker cp $CONTAINER:/opt/app-root/src/build/client/manual "$TARGET.new"; then
  echo "The $TAG image has no manual videos"
  docker rm $CONTAINER >/dev/null
  exit 1
fi
docker rm $CONTAINER >/dev/null

echo "Replacing $TARGET"
rm -rf "$TARGET"
mv "$TARGET.new" "$TARGET"

ls "$TARGET"/*
