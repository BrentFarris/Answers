var sqlite3 = require('sqlite3').verbose();
const fs = require("fs");

const dbName = "answers.db";

console.log('Opening the database connection');
var db = new sqlite3.Database(dbName, (err) => {
    if (err) {
        console.error(err.message);
    } else if (!global.develop) {
        var migrationFile = "./migrations.sql";
        console.log("Looking for migrations");
        if (fs.existsSync(migrationFile)) {
            console.log("Migrations found, running migrations");
            fs.readFile(migrationFile, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log("Running migrations on databse");
                    db.exec(data);
                    console.log("Deleting the migrations file");
                    fs.unlink(migrationFile, (e) => { console.log(e); });
                    console.log("Migrations complete, continuing process");
                }
            });
        } else {
            console.log("No migrations found, continuing process");
        }
    }
});

module.exports = function() {
    this.beginTransaction = function() {
        db.run("BEGIN TRANSACTION");
    };

    this.rollbackTransaction = function() {
        db.run("ROLLBACK");
    };

    this.commitTransaction = function() {
        db.run("COMMIT");
    };

    this.allIn = function(table, select, field, values, order, limit) {
        return new Promise(function (success, failure) {
            let sql = `SELECT ${select} FROM ${table} WHERE ${field} IN (${values.join()})`;
            if (order) {
                sql += ` ORDER BY ${order}`;
            }

            if (limit) {
                sql += ` LIMIT ${limit}`;
            }

            db.all(sql, [], (err, rows) => {
                if (err) {
                    return failure(err);
                }

                success(rows);
            });
        });
    };

    this.all = function (table, conditions, values, order, limit) {
        return new Promise(function (success, failure) {
            if (conditions.length != values.length) {
                failure("The fields and values lengths do not match");
                return;
            }

            let sql = `SELECT * FROM ${table}`;
            if (conditions.length) {
                var conditionStr = conditions.join("=?, ") + "=?";
                sql += ` WHERE ${conditionStr}`;
            }

            if (order) {
                sql += ` ORDER BY ${order}`;
            }

            if (limit) {
                sql += ` LIMIT ${limit}`;
            }

            db.all(sql, values, (err, rows) => {
                if (err) {
                    return failure(err);
                }

                success(rows);
            });
        });
    };

    this.fts5 = function(table, fields, matchField, term) {
        return new Promise(function (success, failure) {
            db.all(`SELECT ${fields} FROM ${table} WHERE ${matchField} MATCH ? ORDER BY rank`, [term], (err, rows) => {
                if (err) {
                    return failure(err);
                }

                success(rows);
            });
        });
    };

    this.get = function (table, fields, conditions, values) {
        return new Promise(function (success, failure) {
            if (conditions.length != values.length) {
                return failure("The fields and values lengths do not match");
            }

            var conditionStr = conditions.join("=? AND ") + "=?";
            db.get(`SELECT ${fields} FROM ${table} WHERE ${conditionStr}`, values, (err, row) => {
                if (err) {
                    return failure(err);
                }

                success(row);
            });
        });
    };

    this.each = function (table, fields, conditions, values, append) {
        let sql = `SELECT ${fields.join()} FROM ${table} WHERE ${conditions.join()} ${append}`;
        return new Promise(function(success, failure) {
            db.each(sql, values, (err, row) => {
                if (err) {
                    throw err;
                } else {
                    success(row);
                }
            });
        });
    };

    this.insert = function (table, fields, values, ignore, replace) {
        return new Promise(function (success, failure) {
            if (fields.length != values.length) {
                return failure("The fields and values lengths do not match");
            }

            var insertPrefix = "Insert";

            if (ignore) {
                insertPrefix += " OR IGNORE";
            } else if (replace) {
                insertPrefix += " OR REPLACE"
            }

            var placeholders = [];
            for (var i = 0; i < values.length; i++) {
                placeholders.push("?");
            }

            // insert one row into the langs table
            db.run(`${insertPrefix} INTO ${table} (${fields.join()}) VALUES(${placeholders.join()})`, values, function (err) {
                if (err) {
                    return failure(err);
                }

                success(this);
            });
        });
    };

    this.insertIgnore = function (table, fields, values) {
        return this.insert(table, fields, values, true);
    };

    this.insertReplace = function (table, fields, values) {
        return this.insert(table, fields, values, false, true);
    };

    this.update = function (table, fields, values, conditions, conditionValues) {
        return new Promise(function (success, failure) {
            if (fields.length != values.length) {
                return failure("The fields and values lengths do not match");
            }

            if (conditions.length != conditionValues.length) {
                return failure("The conditions and values lengths do not match");
            }

            var fieldStr = fields.join("=?, ") + "=?";
            var conditionStr = conditions.join("=?, ") + "=?";
            var allValues = values.concat(conditionValues);

            // insert one row into the langs table
            db.run(`UPDATE ${table} SET ${fieldStr} WHERE ${conditionStr}`, allValues, function (err) {
                if (err) {
                    return failure(err);
                }

                success(this);
            });
        });
    };

    this.delete = function (table, conditions, values) {
        return new Promise(function (success, failure) {
            if (conditions.length != values.length) {
                return failure("The fields and values lengths do not match");
                return;
            }

            // insert one row into the langs table
            db.run(`DELETE FROM ${table} WHERE ${conditions.join()}`, values, function (err) {
                if (err) {
                    return failure(err);
                }

                success(this);
            });
        });
    };

    this.close = function () {
        return new Promise(function (success, failure) {
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    return failure(err);
                }

                console.log("Close the database connection");
                success();
            });
        });
    };
};