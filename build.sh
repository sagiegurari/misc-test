#!/bin/bash

set -ev

docker pull wnameless/oracle-xe-11g

docker build -t test .

#docker stop $(docker ps -a -q)

#-p 49160:22 
docker run -d -p 1521:1521 -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g
docker ps -a

docker run --name test -td --cidfile ./test.cid test
docker ps -a

TEST_CONTAINER=$(cat ./test.cid)
echo "container ID: $TEST_CONTAINER"

docker wait test

docker ps -a
