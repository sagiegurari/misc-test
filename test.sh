#!/bin/bash

wget https://github.com/sagiegurari/simple-oracledb/archive/master.zip
unzip master.zip
cd ./simple-oracledb-master

echo "OCI_LIB_DIR: $OCI_LIB_DIR"
tree $OCI_LIB_DIR
echo "----------------"

echo "OCI_INCLUDE_DIR: $OCI_INCLUDE_DIR"
tree $OCI_INCLUDE_DIR
echo "----------------"

npm --loglevel warn -g --production install mocha chai

npm --loglevel warn --production install

npm --loglevel info --production --unsafe-perm install oracledb

mocha ./test/spec/integration-spec.js
