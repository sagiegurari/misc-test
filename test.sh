#!/bin/bash

wget https://github.com/sagiegurari/simple-oracledb/archive/master.zip
unzip -q master.zip
cd ./simple-oracledb-master

export OCI_LIB_DIR="/opt/oracle/instantclient"

echo "----------------"
echo "OCI_LIB_DIR: $OCI_LIB_DIR"
echo "----------------"
echo "OCI_INCLUDE_DIR: $OCI_INCLUDE_DIR"
echo "----------------"

npm --loglevel warn -g --production install mocha

npm --loglevel warn --production install

npm --loglevel warn --production install chai

cd ./node_modules

ORA_BRANCH="dev-2.0"
mkdir -p /root/.ssh/
touch /root/.ssh/known_hosts
chmod 777 /root/.ssh/known_hosts
ssh-keyscan github.com >> ~/.ssh/known_hosts
mkdir -p ./oracledb
cd ./oracledb
git clone git@github.com:oracle/node-oracledb.git
git checkout ${ORA_BRANCH}
git submodule init
git submodule update
npm --loglevel warn --production --unsafe-perm install
cd ../../

export TEST_ORACLE_CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${DB_PORT_1521_TCP_ADDR})(PORT=${DB_PORT_1521_TCP_PORT}))(CONNECT_DATA=(SID=xe)))"

echo "TEST_ORACLE_USER: ${TEST_ORACLE_USER}"
echo "TEST_ORACLE_PASSWORD: ${TEST_ORACLE_PASSWORD}"
echo "TEST_ORACLE_CONNECTION_STRING: ${TEST_ORACLE_CONNECTION_STRING}"

#wait for db to be up
sleep 30

export TEST_STABILITY="true"

mocha ./test/spec/integration-spec.js
mocha ./test/spec/stability-spec.js
