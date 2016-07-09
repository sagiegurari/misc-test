#!/bin/bash

export NODE_ENV=development

npm --loglevel warn install simple-oracledb
cd ./node_modules/simple-oracledb

npm --loglevel warn install
npm --loglevel warn install oracledb

npm run grunt coverage
