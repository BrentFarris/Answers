const bcrypt = require('bcrypt');
const saltRounds = 10;
const accountTable = "Accounts";
const crypto = require("crypto");

module.exports = function() {
    this.create = async function(username, password, isRequest) {
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
            session = null;
        }

        try {
            await db.insert(accountTable, ["username", "hash", "session", "verified"], [username, hash, session, verified]);
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
        let db = global.getService("db");
        if (!session || !session.length || !session.trim().length) {
            return null;
        }

        return await db.get(accountTable, "*", ["session"], [session]);
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