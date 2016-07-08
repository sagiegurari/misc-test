#!/bin/bash

git clone git@github.com:sagiegurari/simple-oracledb.git
cd simple-oracledb

export NODE_ENV=development

npm install
npm install oracledb

npm test
