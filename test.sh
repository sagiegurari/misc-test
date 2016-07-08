#!/bin/bash

git clone git@github.com:sagiegurari/simple-oracledb.git
cd simple-oracledb

export NODE_ENV=development
export TEST_ORACLE_USER=system
export TEST_ORACLE_PASSWORD=oracle
export TEST_ORACLE_CONNECTION_STRING=localhost/XE

npm install
npm install oracledb

npm test
