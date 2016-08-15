var asyncLib = require('async');
var oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');

const MAX_ROWS = 5000;

var exit = process.exist;
process.exit = function () {
    setTimeout(exit, 500);
};

function onError(error) {
    if (error) {
        console.error(error);
        process.exit();
    }
}

function runTest(state, test, callback) {
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
                console.log('runSuite end...', state);

                cb(error, state);
            });
        });
    });

    asyncLib.series(funcs, callback);
}

function getOracledbTest(pool) {
    return function (callback) {
        pool.getConnection(function (err, connection) {
            onError(err);

            var start = Date.now();
            connection.execute('SELECT * FROM TEST_PERF1', [], {
                maxRows: 100000
            }, function (qErr) {
                var diff = Date.now() - start;
                onError(qErr);

                connection.close(function () {
                    callback(qErr, diff);
                });
            });
        });
    };
}

function getQueryTest(pool) {
    return function (callback) {
        var diff;
        pool.run(function (connection, cb) {
            var start = Date.now();
            connection.query('SELECT * FROM TEST_PERF1', [], {
                maxRows: 100000
            }, function (error) {
                diff = Date.now() - start;

                cb(error);
            });
        }, function (error) {
            callback(error, diff);
        });
    };
}

function getRSTest(pool) {
    return function (callback) {
        var diff;
        pool.run(function (connection, cb) {
            var start = Date.now();
            connection.query('SELECT * FROM TEST_PERF1', [], {
                resultSet: true
            }, function (error) {
                diff = Date.now() - start;

                cb(error);
            });
        }, function (error) {
            callback(error, diff);
        });
    };
}

function getStreamTest(pool) {
    return function (callback) {
        var diff;
        pool.run(function (connection, cb) {
            var start = Date.now();
            var stream = connection.query('SELECT * FROM TEST_PERF1', [], {
                streamResults: true
            });

            stream.on('error', onError);
            stream.on('data', function () {});
            stream.on('end', function () {
                diff = Date.now() - start;

                cb();
            });
        }, function (error) {
            callback(error, diff);
        });
    };
}

function runAll() {
    var connAttrs = {
        user: process.env.TEST_ORACLE_USER || 'barak',
        password: process.env.TEST_ORACLE_PASSWORD || 'barak',
        connectString: process.env.TEST_ORACLE_CONNECTION_STRING || '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.20.30.148)(PORT=1521))(CONNECT_DATA=(SID=LOS)))'
    };

    var oracledbPool;
    var simpleOracleDBPool;

    oracledb.getConnection(connAttrs, function (connErr, connection) {
        if (connErr) {
            console.error(connErr);
            process.exit();
        }

        asyncLib.series([
            function (cb) {
                connection.execute('DROP TABLE TEST_PERF1', function () {
                    cb();
                });
            },
            function (cb) {
                console.log('creating table...');
                connection.execute('CREATE TABLE TEST_PERF1 (COL1 VARCHAR2(250) PRIMARY KEY, COL2 NUMBER, COL3 NUMBER, COL4 VARCHAR2(250))', cb);
            },
            function (cb) {
                SimpleOracleDB.extend(connection);

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

                console.log('batchInsert...');
                connection.batchInsert('INSERT INTO TEST_PERF1 (COL1, COL2, COL3, COL4) VALUES (:COL1, :COL2, :COL3, :COL4)', rowsData, {
                    autoCommit: true
                }, cb);
            },
            function (cb) {
                connection.close(cb);
            },
            function (cb) {
                oracledb.createPool(connAttrs, function (poolErr, pool) {
                    oracledbPool = pool;
                    cb(poolErr);
                });
            },
            function (cb) {
                oracledb.createPool(connAttrs, function (poolErr, pool) {
                    SimpleOracleDB.extend(pool);

                    simpleOracleDBPool = pool;
                    cb(poolErr);
                });
            }
        ], function (asyncErr) {
            onError(asyncErr);

            var oracledbTest = getOracledbTest(oracledbPool);
            var queryTest = getQueryTest(simpleOracleDBPool);
            var rsTest = getRSTest(simpleOracleDBPool);
            var streamTest = getStreamTest(simpleOracleDBPool);

            runSuites([oracledbTest, queryTest, rsTest, streamTest], 10, function () {
                runSuites([oracledbTest, queryTest, rsTest, streamTest], 1000, function (err, states) {
                    console.log(JSON.stringify(states, undefined, 2));

                    console.log(states[0].average, '|', states[1].average, '|', states[2].average, '|', states[3].average);
                });
            });
        });
    });
}

runAll();
