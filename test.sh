#!/bin/bash

export NODE_ENV=development

npm --loglevel verbose warn simple-oracledb
cd ./node_modules/simple-oracledb

npm --loglevel verbose warn install
npm --loglevel verbose warn install oracledb

npm test
