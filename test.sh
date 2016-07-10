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

npm --loglevel warn --production --unsafe-perm install oracledb

echo "TEST_ORACLE_USER: ${TEST_ORACLE_USER}"
echo "TEST_ORACLE_PASSWORD: ${TEST_ORACLE_PASSWORD}"
echo "TEST_ORACLE_CONNECTION_STRING: ${TEST_ORACLE_CONNECTION_STRING}"

set

mocha ./test/spec/integration-spec.js
