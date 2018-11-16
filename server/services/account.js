const bcrypt = require('bcrypt');
const saltRounds = 10;
const accountTable = "Accounts";
const crypto = require("crypto");

module.exports = function() {
    this.create = async function(username, password, isRequest, isAdmin) {
        if (!username || !username.trim().length) {
			return "A username is required to register. <a href='/'>Return Home</a>";
		} else if (!password || !password.trim().length) {
			return "A passwrod is required to register. <a href='/'>Return Home</a>";
		} else if (username.length < 5) {
			return "A recognizable username of 5 characters is required to register. <a href='/'>Return Home</a>";
		} else if (username.indexOf(' ') !== -1) {
			return "A username can not consist of spaces. <a href='/'>Return Home</a>";
		}

        let db = global.getService("db");
        let row = await db.get(accountTable, "*", ["username"], [username]);
        if (row) {
            return "That username already exists";
        }

        let session = await this.generateSession();
        if (!session) {
            return false;
        }

        let hash = await this.encryptPassword(password);
        
        let verified = 1;
        if (isRequest) {
            verified = 0;
        }

        let admin = null;
        if (isAdmin) {
            admin = 1;
        }

        if (isRequest || isAdmin) {
            session = null;
        }

        try {
            await db.insert(accountTable, ["username", "hash", "session", "verified", "admin"], [username, hash, session, verified, admin]);
            return session;
        } catch (e) {
            return false;
        }
    };

    this.getUser = async function(userId) {
        let db = global.getService("db");
        return await db.get(accountTable, "*", ["id"], [userId]);
    };

    this.getUsers = async function(userIds) {
        let db = global.getService("db");
        return await db.allIn(accountTable, "`id`, `username`", "id", userIds);
    };

    this.verifyUser = async function(userId) {
        let db = global.getService("db");
        await db.update(accountTable, ["verified"], [1], ["id"], [userId]);
    };

    this.getUserRequests = async function() {
        let db = global.getService("db");
        return await db.all(accountTable, ["verified"], [0], "`id` DESC", 10);
    };

    this.sessionAccount = async function(req) {
        let session = req.cookies.session;
        if (!session || !session.length || !session.trim().length) {
            return null;
        }
        
        let db = global.getService("db");
        let results = await db.query("SELECT `Accounts`.*, `RateLimits`.`lastQuestion`, `RateLimits`.`lastAnswer`, `RateLimits`.`lastVote` FROM `Accounts` LEFT JOIN `RateLimits` ON `Accounts`.`id`=`RateLimits`.`userId` WHERE `session`=?", [session]);

        if (!results || !results.length) {
            return null;
        }

        return results[0];
    };

    this.updateSession = async function(username) {
        let db = global.getService("db");
        let session = await this.generateSession();
        if (!session) {
            return false;
        }

        await db.update(accountTable, ["session"], [session], ["username"], [username]);
        return session;
    };

    this.clearSession = async function(userId) {
        let db = global.getService("db");
        await db.update(accountTable, ["session"], [null], ["id"], [userId]);
    };

    this.generateSession = async function() {
        let db = global.getService("db");

        // Just try to generate a hash 25 times before giving up
        for (let i = 0; i < 25; i++) {
            let id = crypto.randomBytes(16).toString("hex");
            let row = await db.get(accountTable, "*", ["session"], [id]);

            if (!row) {
                return id;
            }
        }

        return false;
    };

    this.passwordCompare = function(password, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function(err, res) {
                if (!res) {
                    return reject(false);
                }

                resolve(true);
            });
        });
    };

    this.encryptPassword = function(password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    reject(err);
                }

                try {
                    resolve(hash);
                } catch (e) {
                    reject(e);
                }
            });
        });
    };

    this.updatePassword = async function(userId, password) {
        let hash = await this.encryptPassword(password);
        let db = global.getService("db");
        await db.update(accountTable, ["hash"], [hash], ["`id`"], [userId]);
    };

    this.verifyPassword = async function(username, password) {
        let db = global.getService("db");

        let row = await db.get(accountTable, "*", ["`username`"], [username]);

        if (!row || !row.verified) {
            return false;
        }

        try {
            await this.passwordCompare(password, row.hash)
            return true;
        } catch (e) {
            return false;
        }
    }
};