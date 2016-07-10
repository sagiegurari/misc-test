#!/bin/bash

wget https://github.com/sagiegurari/simple-oracledb/archive/master.zip
unzip master.zip
cd ./simple-oracledb-master

tree $OCI_LIB_DIR

tree $OCI_INCLUDE_DIR

npm --loglevel warn -g --production install mocha chai

npm --loglevel warn --production install

npm --loglevel info --production --unsafe-perm install oracledb

mocha ./test/spec/integration-spec.js
