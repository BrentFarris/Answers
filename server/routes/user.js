var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

});

router.get("/requests", async function(req, res, next) {
	let accountService = global.getService("account");
	let account = await accountService.sessionAccount(req);

	if (!account || account.username.toLowerCase() !== "brent") {
		res.redirect("/");
	}

	let requests = await accountService.getUserRequests();
	res.render("userRequests", { title: "Users", account: account, users: requests });
});

router.get("/requests/:id", async function(req, res, next) {
	let accountService = global.getService("account");
	let account = await accountService.sessionAccount(req);

	if (!account || account.username.toLowerCase() !== "brent") {
		res.redirect("/");
	}

	let userId = req.params.id;
	await accountService.verifyUser(userId);
	res.redirect("/user/requests");
});

router.get("/logout", async function(req, res, next) {
	let accountService = global.getService("account");
	let account = await accountService.sessionAccount(req);

	if (!account) {
		res.redirect("/");
	}
	
	await accountService.clearSession(account.id);
	res.clearCookie("session");
	res.redirect("/");
});

router.post("/login", async function(req, res, next) {
	let username = req.body.username;
	let password = req.body.password;
	let accountService = global.getService("account");

	if (req.body.request) {
		if (!username || !username.trim().length) {
			return res.send("A username is required to register. <a href='/'>Return Home</a>");
		} else if (!password || !password.trim().length) {
			return res.send("A passwrod is required to register. <a href='/'>Return Home</a>");
		} else if (username.length < 5) {
			return res.send("A recognizable username of 5 characters is required to register. <a href='/'>Return Home</a>");
		} else if (username.indexOf(' ') !== -1) {
			return res.send("A username can not consist of spaces. <a href='/'>Return Home</a>");
		}

		let result = await accountService.create(username, password, true);
		if (result === false) {
			return res.send("There was a problem creating your request, please try again. <a href='/'>Return Home</a>");
		} else if (result !== null) {
			return res.send(`${result}. <a href='/'>Return Home</a>`);
		}
	
		return res.send(`Your request has been submitted and an admin will verify it soon. <a href='/'>Return Home</a>`);
	}

	if (!await accountService.verifyPassword(username, password)) {
		res.send("The login attempt failed you entered the wrong username/password or your account is not verified. <a href='/'>Return Home</a>");
		return;
	}

	let session = await accountService.updateSession(username);
	if (!session) {
		res.send("There was a problem creating the session, please try again. <a href='/'>Return Home</a>");
		return;
	}

	res.cookie("session", session, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true
	});

	res.redirect("/");
});

router.post("/", async function(req, res, next) {
	let session = await global.getService("account").create(username, password);

	if (!session) {
		res.send("There was an issue creating the account, please try again.  <a href='/'>Return Home</a>");
		return;
	}

	res.cookie("session", session, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true
	});
	
	res.redirect("/");
});

module.exports = router;