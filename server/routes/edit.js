var express = require("express");
var router = express.Router();

router.get("/question/:id", async function(req, res, next) {
    let accountService = global.getService("account");
    let account = await accountService.sessionAccount(req);
    
    if (!account) {
        return res.redirect("/");
    }

    let answerService = global.getService("answers");
    let question = await answerService.getQuestion(parseInt(req.params.id));

    if (!question) {
        return res.redirect("/");
    }

	res.render("editQuestion", { title: "Editing Question", account: account, question: question });
});

router.get("/answer/:id", async function(req, res, next) {
	let accountService = global.getService("account");
    let account = await accountService.sessionAccount(req);
    
    if (!account) {
        return res.redirect("/");
    }

    let answerService = global.getService("answers");
    let answer = await answerService.getAnswer(parseInt(req.params.id));

    if (!answer) {
        return res.redirect("/");
    }

	res.render("editAnswer", { title: "Editing Answer", account: account, answer: answer });
});

module.exports = router;