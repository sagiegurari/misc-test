#!/bin/bash

set -ev

docker pull wnameless/oracle-xe-11g

#-p 49160:22 
docker run -d -p 1521:1521 -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g
docker ps -a

docker build -t test .

#docker stop $(docker ps -a -q)

export PARENT_HOST=`/sbin/ip route|awk '/default/ { print  $3}'`
echo "parent host: ${PARENT_HOST}"

docker run --add-host dockerhost:${PARENT_HOST} --name test -t --cidfile ./test.cid test
