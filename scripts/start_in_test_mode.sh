#!/bin/bash

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))

CONTAINER=palaute_test_db
SERVICE_NAME=db
DB_NAME=postgres

DOCKER_COMPOSE=$PROJECT_ROOT/docker-compose.ci.yml
TEST_DATA_LOCATION=$PROJECT_ROOT/tests/
TEST_DATA_FILE=testdata.gz

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 3;
    done
}

echo "Removing database and related volume"
docker-compose -f $DOCKER_COMPOSE down -v

echo "Starting postgres in the background"

docker-compose -f $DOCKER_COMPOSE up -d $SERVICE_NAME

retry docker-compose -f $DOCKER_COMPOSE exec $SERVICE_NAME pg_isready --dbname=$DB_NAME


echo "Populating test db"
docker exec -i $CONTAINER /bin/bash -c "gunzip | psql -U postgres" < ${TEST_DATA_LOCATION}/${TEST_DATA_FILE}

echo "Checking running services"
docker-compose -f $DOCKER_COMPOSE up -d
