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
cd ..
npm install oracle/node-oracledb.git#${ORA_BRANCH} --loglevel warn --production --unsafe-perm install
#wget https://github.com/oracle/node-oracledb/archive/${ORA_BRANCH}.zip
#unzip -q ${ORA_BRANCH}.zip
#mv ./node-oracledb-${ORA_BRANCH} ./oracledb
#cd ./oracledb
#npm --loglevel warn --production --unsafe-perm install
#cd ../../

export TEST_ORACLE_CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${DB_PORT_1521_TCP_ADDR})(PORT=${DB_PORT_1521_TCP_PORT}))(CONNECT_DATA=(SID=xe)))"

echo "TEST_ORACLE_USER: ${TEST_ORACLE_USER}"
echo "TEST_ORACLE_PASSWORD: ${TEST_ORACLE_PASSWORD}"
echo "TEST_ORACLE_CONNECTION_STRING: ${TEST_ORACLE_CONNECTION_STRING}"

#wait for db to be up
sleep 30

export TEST_STABILITY="true"

mocha ./test/spec/integration-spec.js
mocha ./test/spec/stability-spec.js
