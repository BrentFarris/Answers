var express = require("express");
var router = express.Router();

async function show(req, res) {
    let accountService = global.getService("account");
	let account = await accountService.sessionAccount(req);
    let questionId = req.params.id;
    let answerId = req.params.answerId;
	let answerService = global.getService("answers");
    let result = await answerService.get(questionId);
    
    let userIds = [result.question.userId];
    for (let i = 0; i < result.answers.length; i++) {
        userIds.push(result.answers[i].userId);
    }

    let users = await accountService.getUsers(userIds);
    let userHash = {};
    for (let i = 0; i < users.length; i++) {
        userHash[users[i].id] = users[i];
    }

	res.render("answer", { title: result.question.question, account: account, data: result, users: userHash });
}

router.get("/:id/:question", async function(req, res, next) {
    show(req, res);
});

router.get("/:id/:question/:answerId", async function(req, res, next) {
    show(req, res);
});

router.post("/", async function(req, res, next) {
    let account = await global.getService("account").sessionAccount(req);
    if (!account) {
        res.redirect("/");
        return;
    }

    let question = req.body.question.trim();
    let description = req.body.description.trim();
    
    if (!question.length) {
        res.send("You can't submit a question without there being a question. <a href='/'>Return Home</a>");
        return;
    }

    let id = await global.getService("answers").question(account.id, question, description);
    res.redirect(`/answer/${id}/${question}`);
});

router.post("/:id", async function(req, res, next) {
    let account = await global.getService("account").sessionAccount(req);
    if (!account) {
        res.redirect("/");
        return;
    }

    let questionId = req.params.id.trim();
    let answer = req.body.answer.trim();
    
    if (!answer.length) {
        res.send("You can't submit an answer without there being an answer. <a href='/'>Return Home</a>");
        return;
    }

    let id = await global.getService("answers").answer(account.id, questionId, answer);
    res.redirect(`/answer/${questionId}/answered/${id}`);
});

router.post("/vote/question", async function(req, res, next) {
    let account = await global.getService("account").sessionAccount(req);
    if (!account) {
        res.redirect("/");
        return;
    }

    let questionId = parseInt(req.body.id);
    let isUpVote = req.body.vote;
    let result = await global.getService("answers").questionVote(account.id, questionId, isUpVote);
    res.json({rating: result});
});

router.post("/vote/answer", async function(req, res, next) {
    let account = await global.getService("account").sessionAccount(req);
    if (!account) {
        res.redirect("/");
        return;
    }

    let answerId = parseInt(req.body.id);
    let isUpVote = req.body.vote;
    let result = await global.getService("answers").answerVote(account.id, answerId, isUpVote);
    res.json({rating: result});
});

module.exports = router;