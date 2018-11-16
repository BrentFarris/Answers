var express = require("express");
var router = express.Router();

router.get('/', async function(req, res, next) {
	let account = await global.getService("account").sessionAccount(req);
	let answers = global.getService("answers");
	let recent = await answers.recent(10);
	res.render("index", { title: "Answers", account: account, recent: recent });
});

module.exports = router;