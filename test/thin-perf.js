'use strict';

var runner = require('./runner');
var asyncLib = require('async');
var SimpleOracleDB = require('simple-oracledb');

const MAX_ROWS = 5000;

function getQueryTest(dbData) {
    var connection = {
        execute: function () {
            arguments[arguments.length - 1](null, dbData);
        }
    };
    SimpleOracleDB.extend(connection);

    dbData = {
        metaData: Object.keys(dbData[0]),
        rows: dbData
    };

    return function (callback) {
        var diff;
        var start = Date.now();
        connection.query('SELECT * FROM TEST_PERF1', [], {
            maxRows: 100000,
            resultSet: false
        }, function (error, result) {
            diff = Date.now() - start;

            if (error) {
                callback(error);
            } else {
                if (result.length !== MAX_ROWS) {
                    callback(new Error('[QueryTest] invalid result, ' + result.length));
                } else {
                    callback(null, diff);
                }
            }
        });
    };
}

function runAll() {
    var i;
    var rowsData = [];
    for (i = 0; i < MAX_ROWS; i++) {
        rowsData.push({
            COL1: 'PK' + i,
            COL2: i,
            COL3: i % 10,
            COL4: 'STR' + (i % 10)
        });
    }

    var queryTest = getQueryTest(rowsData);

    asyncLib.series([
        function (cb) {
            runner.runSuites([queryTest], 10, cb);
        },
        function (cb) {
            runner.runSuites([queryTest], 100, cb);
        },
        function (cb) {
            runner.runSuites([queryTest], 100, cb);
        },
        function (cb) {
            runner.runSuites([queryTest], 10, cb);
        }
    ], function () {
        process.exit();
    });
}

runAll();
