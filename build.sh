#!/bin/bash

set -ev

#docker stop $(docker ps -a -q)

#docker pull wnameless/oracle-xe-11g
#docker run -d -p 35353:1521 -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g

docker pull alexeiled/docker-oracle-xe-11g
docker run -d --shm-size=1g -p 35353:1521 alexeiled/docker-oracle-xe-11g

docker ps -a

docker build -t test .

export PARENT_HOST=`/sbin/ip route|awk '/default/ { print  $3}'`
echo "parent host: ${PARENT_HOST}"

export DB_CONNECT_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${PARENT_HOST})(PORT=35353))(CONNECT_DATA=(SID=xe)))"

docker run --env TEST_ORACLE_CONNECTION_STRING="${DB_CONNECT_STRING}" --add-host dockerhost:${PARENT_HOST} --name test -t --cidfile ./test.cid test
