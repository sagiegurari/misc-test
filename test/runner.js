'use strict';

var asyncLib = require('async');

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

module.exports = {
    gc: gc,
    runTest: runTest,
    runSuite: runSuite,
    runSuites: runSuites
};
