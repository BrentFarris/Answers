var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.redirect("/");
});

router.get("/requests", async function(req, res, next) {
	let accountService = global.getService("account");
	let account = await accountService.sessionAccount(req);

	if (!account || !account.admin) {
		res.redirect("/");
	}

	let requests = await accountService.getUserRequests();
	res.render("userRequests", { title: "Users", account: account, users: requests });
});

router.get("/requests/:id", async function(req, res, next) {
	let accountService = global.getService("account");
	let account = await accountService.sessionAccount(req);

	if (!account || !account.admin) {
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
		let info = req.body.info;

		if (info) {
			info = info.trim();
		}

		let result = await accountService.create(username, password, info, true);
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

module.exports = router;