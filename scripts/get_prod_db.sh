#!/bin/bash

CONTAINER=palaute_db
SERVICE_NAME=db
DB_NAME=postgres

JAMI_DB=jami-db

PALAUTE_FILE_NAME=palaute.sql.gz
JAMI_FILE_NAME=jami.sql.gz

SERVER=toska.cs.helsinki.fi
SERVER_PATH=/home/toska_user/most_recent_backup_store/

PALAUTE_SERVER_FILE=${SERVER_PATH}${PALAUTE_FILE_NAME}
JAMI_SERVER_FILE=${SERVER_PATH}${JAMI_FILE_NAME}

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
BACKUPS=$PROJECT_ROOT/backups/
DOCKER_COMPOSE=$PROJECT_ROOT/docker-compose.yml

USER_DATA_FILE_PATH=$PROJECT_ROOT/scripts/my_username

username=""

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 3;
    done
}

get_username() {
  # Check if username has already been set
  [ -z "$username" ]|| return 0

  # Check if username is saved to data file and ask it if not
  if [ ! -f "$USER_DATA_FILE_PATH" ]; then
    echo ""
    echo "!! No previous username data found. Will ask it now !!"
    echo "Enter your Uni Helsinki username:"
    read username
    echo $username > $USER_DATA_FILE_PATH
    echo "Succesfully saved username"
    echo ""
  fi

  # Set username
  username=$(cat $USER_DATA_FILE_PATH | head -n 1)
}

echo "Creating backups folder"
mkdir -p ${BACKUPS}

echo "Fetching a new dump"
get_username
scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" $username@$SERVER:$PALAUTE_SERVER_FILE $JAMI_SERVER_FILE $BACKUPS

echo "Removing database and related volume"
docker compose -f $DOCKER_COMPOSE down -v

echo "Starting postgres in the background"
docker compose -f $DOCKER_COMPOSE up -d $SERVICE_NAME $JAMI_DB

retry docker compose -f $DOCKER_COMPOSE exec $SERVICE_NAME pg_isready --dbname=$DB_NAME

echo "Populating Norppa"
docker exec -i $CONTAINER /bin/bash -c "gunzip | psql -U postgres" < ${BACKUPS}${PALAUTE_FILE_NAME}

retry docker compose -f $DOCKER_COMPOSE exec $JAMI_DB pg_isready --dbname=$JAMI_DB

echo "Populating Jami"
docker exec -i $JAMI_DB /bin/bash -c "gunzip | psql -U postgres" < ${BACKUPS}${JAMI_FILE_NAME}
