#!/bin/bash

CONTAINER=palaute_db
SERVICE_NAME=db
DB_NAME=postgres

JAMI_CONTAINER=jami-db
JAMI_SERVICE_NAME=jami-db
JAMI_DB_NAME=postgres

FOLDER_NAME="norppa"
JAMI_FOLDER_NAME="jami"

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
BACKUPS=$PROJECT_ROOT/backups/
DOCKER_COMPOSE=$PROJECT_ROOT/docker-compose.yml

S3_CONF=~/.s3cfg

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 3;
    done
}

if [ ! -f "$S3_CONF" ]; then
  echo ""
  echo "!! No config file for s3 bucket !!"
  echo "Create file for path ~/.s3cfg and copy the credetials from version.helsinki.fi"
  echo ""
  exit 0
fi

echo "Creating backups folder"
mkdir -p ${BACKUPS}

# --- Norppa Selection ---
echo "Listing available Norppa backups in S3 bucket..."
backup_files=$(s3cmd -c "$S3_CONF" ls "s3://psyduck/${FOLDER_NAME}/" | awk '{print $4}' | grep '\.sql\.gz$')

if [ -z "$backup_files" ]; then
  echo "No Norppa backup files found in S3 bucket!"
  exit 1
fi

echo "Available Norppa backups:"
select chosen_backup in $backup_files; do
  if [ -n "$chosen_backup" ]; then
    echo "You selected: $chosen_backup"
    FILE_NAME=$(basename "$chosen_backup")
    break
  else
    echo "Invalid selection. Please select a valid backup number."
  fi
done

# --- Jami Selection ---
echo "Listing available Jami backups in S3 bucket..."
jami_backup_files=$(s3cmd -c "$S3_CONF" ls "s3://psyduck/${JAMI_FOLDER_NAME}/" | awk '{print $4}' | grep '\.sql\.gz$')

if [ -z "$jami_backup_files" ]; then
  echo "No Jami backup files found in S3 bucket!"
  exit 1
fi

echo "Available Jami backups:"
select chosen_jami_backup in $jami_backup_files; do
  if [ -n "$chosen_jami_backup" ]; then
    echo "You selected: $chosen_jami_backup"
    JAMI_FILE_NAME=$(basename "$chosen_jami_backup")
    break
  else
    echo "Invalid selection. Please select a valid backup number."
  fi
done


# --- Downloads ---
echo "Fetching the selected Norppa dump: $FILE_NAME"
s3cmd -c "$S3_CONF" get "$chosen_backup" "$BACKUPS"

if [ ! -f "${BACKUPS}${FILE_NAME}" ]; then
  echo "Download failed or file not found: ${BACKUPS}${FILE_NAME}"
  exit 1
fi

echo "Fetching the selected Jami dump: $JAMI_FILE_NAME"
s3cmd -c "$S3_CONF" get "$chosen_jami_backup" "$BACKUPS"

if [ ! -f "${BACKUPS}${JAMI_FILE_NAME}" ]; then
  echo "Download failed or file not found: ${BACKUPS}${JAMI_FILE_NAME}"
  exit 1
fi

# --- Reset and Start ---
echo "Removing database and related volume"
docker-compose -f $DOCKER_COMPOSE down -v

echo "Starting postgres containers in the background"
docker-compose -f $DOCKER_COMPOSE up -d $SERVICE_NAME $JAMI_SERVICE_NAME

# --- Populate Norppa ---
retry docker-compose -f $DOCKER_COMPOSE exec $SERVICE_NAME pg_isready --dbname=$DB_NAME

echo "Populating ${FOLDER_NAME}"
docker exec -i $CONTAINER /bin/bash -c "gunzip | psql -U postgres" < ${BACKUPS}${FILE_NAME}

# --- Populate Jami ---
retry docker-compose -f $DOCKER_COMPOSE exec $JAMI_SERVICE_NAME pg_isready --dbname=$JAMI_DB_NAME

echo "Populating ${JAMI_FOLDER_NAME}"
docker exec -i $JAMI_CONTAINER /bin/bash -c "gunzip | psql -U postgres" < ${BACKUPS}${JAMI_FILE_NAME}