#!/bin/bash

# stop & cleanup any running postgres containers
docker stop postgres
docker rm postgres

# start postgres
docker run -d --rm --name postgres --network=host -e POSTGRES_PASSWORD=robots postgres

# wait for postgres to start
echo "sleeping until postgres startup complete..."
PGREADY=0
while [ $PGREADY -ne 1 ]; do
  sleep 2
  PGSTATUS=`docker exec -it postgres psql -U postgres -c 'select version()' postgres`
  if [[ $PGSTATUS == psql* ]]; then
    echo "the database is still starting up..."
    PGREADY=0
  else
    echo "the database is ready"
    PGREADY=1
  fi
done

# copy init script & populate db
echo "populating the database"
docker cp ./init-db.sql postgres:/init-db.sql
docker exec -u postgres postgres psql postgres postgres -f /init-db.sql
