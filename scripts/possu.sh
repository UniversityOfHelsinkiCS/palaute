#!/usr/bin/env bash

CONTAINER_NAME="palaute_db"
USER="postgres"
DB="${1:-postgres}"

docker exec -it "$CONTAINER_NAME" psql -U "$USER" "$DB"