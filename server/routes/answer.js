var express = require("express");
var router = express.Router();

const questionLimitMilliseconds = 60000;
const answerLimitMilliseconds = 60000;
const voteLimitSeconds = 0;

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
        return res.redirect("/");
    }

    if (account.lastQuestion) {
        if (new Date() - new Date(account.lastQuestion) < questionLimitMilliseconds) {
            // TODO:  Rather than just redirecting the user, they should get a rate limit warning
            return res.redirect("/");
        }
    }

    let question = req.body.question.trim();
    let description = "";
    if (req.body.description) {
        description = req.body.description.trim();
    }
    
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

    if (account.lastQuestion) {
        if (new Date() - new Date(account.lastAnswer) < answerLimitMilliseconds) {
            // TODO:  Rather than just redirecting the user, they should get a rate limit warning
            return res.redirect("/");
        }
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

router.post("/updateQuestion/:id", async function(req, res, next) {
    let account = await global.getService("account").sessionAccount(req);
    if (!account) {
        return res.redirect("/");
    }

    let questionId = req.params.id.trim();
    let description = req.body.description.trim();

    if (!description.length) {
        res.send("You can't submit a question without there being a question. <a href='/'>Return Home</a>");
        return;
    }

    let answerService = global.getService("answers");
    let questionEntry = await answerService.getQuestion(questionId);

    if (!questionEntry || questionEntry.userId !== account.id) {
        return res.redirect("/");
    }

    await answerService.updateQuestion(questionEntry.id, description);
    res.redirect(`/answer/${questionEntry.id}/${questionEntry.question}`);
});

router.post("/updateAnswer/:id", async function(req, res, next) {
    let account = await global.getService("account").sessionAccount(req);
    if (!account) {
        return res.redirect("/");
    }

    let answerId = req.params.id.trim();
    let answer = req.body.answer.trim();

    if (!answer.length) {
        res.send("You can't submit an answer without there being an answer. <a href='/'>Return Home</a>");
        return;
    }

    let answerService = global.getService("answers");
    let answerEntry = await answerService.getAnswer(answerId);

    if (!answerEntry || answerEntry.userId !== account.id) {
        return res.redirect("/");
    }

    await answerService.updateAnswer(answerEntry.id, answer);
    res.redirect(`/answer/${answerEntry.questionId}/answered/${answerEntry.id}`);
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