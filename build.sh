#!/bin/bash

set -ev

docker pull wnameless/oracle-xe-11g

docker build -t test .

#docker stop $(docker ps -a -q)

#-p 49160:22 
docker run -d -p 1521:1521 -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g
docker ps -a

docker run --name test -t --cidfile ./test.cid test
