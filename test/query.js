'use strict';

var asyncLib = require('async');
var SimpleOracleDB = require('../..');

var colsCount = 30;
var rowsCount = 1000;

function exit() {
    setTimeout(process.exit, 250);
}

function onError(error) {
    if (error) {
        console.error(error);
        exit();
    }
}

function runTest(state, test, callback) {
    var start = Date.now();

    test(function (error) {
        var end = Date.now();

        onError(error);

        var diff = end - start;

        state.counter++;

        if ((state.min === -1) || (state.min > diff)) {
            state.min = diff;
        }
        if ((state.min === -1) || (state.max < diff)) {
            state.max = diff;
        }
        state.total = state.total + diff;

        setTimeout(callback, 0);
    });
}

function runSuite(test, loops, callback) {
    console.log('runSuite...');

    var state = {
        counter: 0,
        total: 0,
        min: -1,
        max: -1
    };

    asyncLib.until(function () {
        return state.counter >= loops;
    }, function (cb) {
        runTest(state, test, cb);
    }, function (error) {
        onError(error);

        state.average = state.total / state.counter;
        state.averageRow = (state.average / rowsCount);
        state.averageRowColumn = (state.averageRow / colsCount).toFixed(4);
        state.averageRow = state.averageRow.toFixed(4);

        console.log('runSuite end...', state);

        callback(null, state);
    });
}

function runSuites(tests, loops, callback) {
    console.log('runSuites...');

    var funcs = [];
    tests.forEach(function (test) {
        funcs.push(function (cb) {
            runSuite(test, loops, function (error, state) {
                onError(error);

                cb(error, state);
            });
        });
    });

    asyncLib.series(funcs, callback);
}

function createTestData() {
    var data = {
        metaData: [],
        rows: []
    };

    var col;
    for (col = 1; col <= colsCount; col++) {
        data.metaData.push('COL' + col);
    }

    var row;
    var rowData;
    for (row = 0; row < rowsCount; row++) {
        rowData = {
            COL1: row,
            COL2: (row % 100),
            COL3: 'row: ' + row,
            COL4: new Date(),
            COL5: true,
            COL6: false
        };

        for (col = (Object.keys(rowData).length + 1); col <= data.metaData.length; col++) {
            rowData['COL' + col] = Date.now();
        }

        data.rows.push(rowData);
    }

    data = {
        rows: data
    };

    data.resultSet = {
        metaData: data.rows.metaData,
        resultSet: {
            close: function (callback) {
                callback();
            },
            getRows: function (number, callback) {
                var subData = data.rows.rows.slice(data.location, data.location + number);
                data.location = data.location + number;
                callback(null, subData);
            }
        }
    };

    return data;
}

function query4Rows(connection) {
    return function (callback) {
        connection.query('sql', [], {
            resultSet: false
        }, function (error, results) {
            if (error || (results.length !== rowsCount)) {
                console.error('invalid result: ', (error || results.length));
                exit();
            } else {
                callback();
            }
        });
    }
}

function query4RS(connection) {
    return function (callback) {
        connection.query('sql', function (error, results) {
            if (error || (results.length !== rowsCount)) {
                console.error('invalid result: ', (error || results.length));
                exit();
            } else {
                callback();
            }
        });
    }
}

function run() {
    var testData = createTestData();

    var connection = {
        execute: function (sql, bindParams, options, callback) {
            if (options.resultSet) {
                testData.location = 0;
                callback(null, testData.resultSet);
            } else {
                callback(null, testData.rows);
            }
        }
    };
    SimpleOracleDB.extend(connection);

    var rowsTest = query4Rows(connection);
    var rsTest = query4RS(connection);

    var tests = [rowsTest, rsTest];

    var index;
    runSuites(tests, 10, function () {
        runSuites(tests, 1000, function (states) {
            console.log(states);
        });
    });
}

run();
