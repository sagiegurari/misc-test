#!/bin/bash

wget https://github.com/sagiegurari/simple-oracledb/archive/master.zip
unzip master.zip
cd ./simple-oracledb-master

export NODE_ENV=development

npm --loglevel warn install
npm --loglevel warn install oracledb

cp /test/oracle-test.js ./test/spec/

npm run grunt mocha_istanbul:coverage --force
