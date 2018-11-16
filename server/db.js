var sqlite3 = require('sqlite3').verbose();
const fs = require("fs");

var dbName = "./gob-bot.db";
if (global.develop) {
    dbName = "./gob-bot-dev.db";
}

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
                    db.run(data);
                    fs.unlink(migrationFile);
                    console.log("Migrations complete, continuing process");
                }
            });
        } else {
            console.log("No migrations found, continuing process");
        }
    }
});

module.exports = {
    all: function (table, conditions, values, order) {
        return new Promise(function (success, failure) {
            if (conditions.length != values.length) {
                failure("The fields and values lengths do not match");
                return;
            }

            let sql = `SELECT * FROM ${table} WHERE ${conditions}`;

            if (order) {
                sql += `ORDER BY ${order}`;
            }

            db.all(sql, values, (err, rows) => {
                if (err) {
                    failure(err);
                    return;
                }

                success(rows);
            });
        });
    },
    get: function (table, fields, conditions, values) {
        return new Promise(function (success, failure) {
            if (conditions.length != values.length) {
                failure("The fields and values lengths do not match");
                return;
            }

            var conditionStr = conditions.join("=?, ") + "=?";
            db.get(`SELECT ${fields} FROM ${table} WHERE ${conditionStr}`, values, (err, row) => {
                if (err) {
                    failure(err);
                    return;
                }

                success(row);
            });
        });
    },
    each: function (table, fields, conditions, values, append) {
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
    },
    insert: function (table, fields, values, ignore) {
        return new Promise(function (success, failure) {
            if (fields.length != values.length) {
                failure("The fields and values lengths do not match");
                return;
            }

            var insertPrefix = "Insert";

            if (ignore) {
                insertPrefix += " OR IGNORE";
            }

            var placeholders = [];
            for (var i = 0; i < values.length; i++) {
                placeholders.push("?");
            }

            // insert one row into the langs table
            db.run(`${insertPrefix} INTO ${table} (${fields.join()}) VALUES(${placeholders.join()})`, values, function (err) {
                if (err) {
                    failure(err);
                    return;
                }

                success(this);
            });
        });
    },
    insertIgnore: function (table, fields, values) {
        return this.insert(table, fields, values, true);
    },
    update: function (table, fields, values, conditions, conditionValues) {
        return new Promise(function (success, failure) {
            if (fields.length != values.length) {
                failure("The fields and values lengths do not match");
                return;
            }

            if (conditions.length != conditionValues.length) {
                failure("The conditions and values lengths do not match");
                return;
            }

            var fieldStr = fields.join("=?, ") + "=?";
            var conditionStr = conditions.join("=?, ") + "=?";
            var allValues = values.concat(conditionValues);

            // insert one row into the langs table
            db.run(`UPDATE ${table} SET ${fieldStr} WHERE ${conditionStr}`, allValues, function (err) {
                if (err) {
                    failure(err);
                    return;
                }

                success(this);
            });
        });
    },
    delete: function (table, conditions, values) {
        return new Promise(function (success, failure) {
            if (conditions.length != values.length) {
                failure("The fields and values lengths do not match");
                return;
            }

            // insert one row into the langs table
            db.run(`DELETE FROM ${table} WHERE ${conditions.join()}`, values, function (err) {
                if (err) {
                    failure(err);
                    return;
                }

                success(this);
            });
        });
    },
    close: function () {
        return new Promise(function (success, failure) {
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    failure(err);
                    return;
                }

                console.log("Close the database connection");
                success();
            });
        });
    }
};