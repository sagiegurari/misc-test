'use strict';

/*global describe: false, it: false*/

var asyncLib = require('async');
var chai = require('chai');
var assert = chai.assert;

describe('Stability Tests', function () {
    var self = this;

    var integrated = true;
    var connAttrs = {
        user: process.env.TEST_ORACLE_USER,
        password: process.env.TEST_ORACLE_PASSWORD,
        connectString: process.env.TEST_ORACLE_CONNECTION_STRING
    };

    var oracledb = require('oracledb');

    oracledb.autoCommit = true;

    var simpleOracleDB = require('../../');
    simpleOracleDB.extend(oracledb);

    var end = function (done, connection) {
        if (connection) {
            connection.release();
        }

        setTimeout(done, 10);
    };

    var testPool;
    var initDB = function (tableName, data, cb) {
        oracledb.getConnection(connAttrs, function (connErr, connection) {
            data = data || [];

            if (connErr) {
                console.error(connErr);
                setTimeout(function () {
                    assert.fail('UNABLE TO OPEN DB CONNECTION.');
                }, 100);
            } else {
                connection.execute('DROP TABLE ' + tableName, [], function () {
                    connection.execute('CREATE TABLE ' + tableName + ' (COL1 VARCHAR2(250) PRIMARY KEY, COL2 NUMBER, COL3 NUMBER, COL4 VARCHAR2(250), LOB1 CLOB, LOB2 BLOB)', [], function (createError) {
                        if (createError) {
                            console.error(createError);
                            assert.fail('UNABLE TO CREATE DB TABLE: ' + tableName);
                        } else {
                            var func = [];
                            data.forEach(function (rowData) {
                                func.push(function (asyncCB) {
                                    if (!rowData.COL4) {
                                        rowData.COL4 = undefined;
                                    }
                                    if (!rowData.LOB1) {
                                        rowData.LOB1 = undefined;
                                    }
                                    if (!rowData.LOB2) {
                                        rowData.LOB2 = undefined;
                                    }

                                    connection.execute('INSERT INTO ' + tableName + ' (COL1, COL2, COL3, COL4, LOB1, LOB2) VALUES (:COL1, :COL2, :COL3, :COL4, :LOB1, :LOB2)', rowData, function (insertErr) {
                                        if (insertErr) {
                                            asyncCB(insertErr);
                                        } else {
                                            asyncCB(null, rowData);
                                        }
                                    });
                                });
                            });

                            asyncLib.series(func, function (asynErr) {
                                connection.release(function (rerr) {
                                    if (asynErr) {
                                        console.error(data, asynErr);
                                        assert.fail('UNABLE TO CREATE DB POOL.');
                                    } else if (rerr) {
                                        console.error('release error: ', rerr);
                                    } else if (testPool) {
                                        cb(testPool);
                                    } else {
                                        oracledb.createPool(connAttrs, function (perr, newPool) {
                                            if (perr) {
                                                console.error(perr);
                                                assert.fail('UNABLE TO CREATE DB POOL.');
                                            } else {
                                                testPool = newPool;
                                                cb(testPool);
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    };

    self.timeout(600000);

    it('batchInsert and query - LOB data', function (done) {
        var table = 'TEST_ORA_STB1';

        var longClobText = 'this is a really long line of test data\n';
        var index;
        var buffer = [];
        for (index = 0; index < 1000; index++) {
            buffer.push(longClobText);
        }
        longClobText = buffer.join('');

        initDB(table, [], function (pool) {
            pool.getConnection(function (err, connection) {
                assert.isNull(err);

                var rowData = [];
                for (index = 0; index < 100; index++) {
                    rowData.push({
                        value1: 'test' + index,
                        value2: index,
                        clob1: longClobText,
                        blob2: new Buffer('blob text here')
                    });
                }

                connection.batchInsert('INSERT INTO ' + table + ' (COL1, COL2, LOB1, LOB2) values (:value1, :value2, EMPTY_CLOB(), EMPTY_BLOB())', rowData, {
                    autoCommit: true,
                    lobMetaInfo: {
                        LOB1: 'clob1',
                        LOB2: 'blob2'
                    }
                }, function (error, results) {
                    assert.isNull(error);
                    assert.equal(rowData.length, results.length);
                    assert.equal(1, results[0].rowsAffected);

                    connection.query('SELECT * FROM ' + table + ' ORDER BY COL1 ASC', function (queryError, jsRows) {
                        assert.isNull(queryError);
                        assert.equal(jsRows.length, rowData.length);

                        for (index = 0; index < 100; index++) {
                            assert.deepEqual({
                                COL1: 'test' + index,
                                COL2: index,
                                COL3: undefined,
                                COL4: undefined,
                                LOB1: longClobText,
                                LOB2: new Buffer('blob text here')
                            }, jsRows[index]);
                        }

                        end(done, connection);
                    });
                });
            });
        });
    });
});
