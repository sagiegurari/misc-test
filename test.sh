#!/bin/bash

npm install simple-oracledb
cd ./node_modules/simple-oracledb

export NODE_ENV=development

npm install
npm install oracledb

export TEST_ORACLE_USER=system
export TEST_ORACLE_PASSWORD=oracle
export TEST_ORACLE_CONNECTION_STRING=localhost/XE

npm test
