var asyncLib = require('async');
var SimpleOracleDB = require('simple-oracledb');

const MAX_ROWS = 5000;

var exit = process.exist;
process.exit = function () {
    setTimeout(exit, 500);
};

function gc() {
    if (global.gc) {
        var i;
        for (i = 0; i < 3; i++) {
            global.gc();
        }
    }
}

function onError(error) {
    if (error) {
        console.error(error);
        process.exit();
    }
}

function runTest(state, test, callback) {
    gc();

    var start = Date.now();

    test(function (error, diff) {
        var end = Date.now();

        onError(error);

        var diffFull = end - start;

        state.counter++;

        if ((state.min === -1) || (state.min > diff)) {
            state.min = diff;
        }
        if ((state.min === -1) || (state.max < diff)) {
            state.max = diff;
        }
        state.total = state.total + diff;

        if ((state.minFull === -1) || (state.minFull > diffFull)) {
            state.minFull = diffFull;
        }
        if ((state.maxFull === -1) || (state.maxFull < diffFull)) {
            state.maxFull = diffFull;
        }
        state.totalFull = state.totalFull + diffFull;

        gc();
        setTimeout(callback, 0);
    });
}

function runSuite(test, loops, callback) {
    console.log('runSuite...');

    var state = {
        counter: 0,
        total: 0,
        totalFull: 0,
        min: -1,
        max: -1,
        minFull: -1,
        maxFull: -1
    };

    asyncLib.until(function () {
        return state.counter >= loops;
    }, function (cb) {
        runTest(state, test, cb);
    }, function (error) {
        onError(error);

        state.average = state.total / state.counter;
        state.averageFull = state.totalFull / state.counter;
        state.averageDiff = (state.averageFull - state.average).toFixed(2);

        callback(null, state);
    });
}

function runSuites(tests, loops, callback) {
    console.log('runSuites...');

    var funcs = [];
    tests.forEach((test) => {
        funcs.push(function (cb) {
            runSuite(test, loops, function (error, state) {
                onError(error);

                gc();
                console.log('runSuite end...\n', state, '\nmemory usage:', process.memoryUsage());

                cb(error, state);
            });
        });
    });

    asyncLib.series(funcs, callback);
}

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
            runSuites([queryTest], 10, cb);
        },
        function (cb) {
            runSuites([queryTest], 100, cb);
        },
        function (cb) {
            runSuites([queryTest], 100, cb);
        },
        function (cb) {
            runSuites([queryTest], 100, cb);
        },
        function (cb) {
            runSuites([queryTest], 100, cb);
        },
        function (cb) {
            runSuites([queryTest], 10, cb);
        }
    ], function () {
        process.exit();
    });
}

runAll();
