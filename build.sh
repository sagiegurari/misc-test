#!/bin/bash

docker pull wnameless/oracle-xe-11g
docker pull collinestes/docker-node-oracle

docker run -d -p 49160:22 -p 1521:1521 -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g
docker ps -a

docker run -td --cidfile ./test.cid collinestes/docker-node-oracle
docker ps -a

TEST_CONTAINER=$(cat ./test.cid)
echo "container ID: $TEST_CONTAINER"

docker cp ./test.sh | $TEST_CONTAINER:/test.sh

docker exec $TEST_CONTAINER "/test.sh"
