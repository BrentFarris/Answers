var express = require("express");
var router = express.Router();

router.get('/', async function(req, res, next) {
	let account = await global.getService("account").sessionAccount(req);
	let terms = req.query.terms;
	let answers = global.getService("answers");
	let rows = await answers.search(terms);
	res.render("search", { title: "Answers Search", account: account, rows: rows });
});

module.exports = router;