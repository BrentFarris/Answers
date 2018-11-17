const questionTable = "Questions";
const ftsQuestionTable = "VirtualQuestions";
const answerTable = "Answers";
const questionVoteTable = "QuestionVotes";
const answerVoteTable = "AnswerVotes";

module.exports = function() {
    this.question = async function(userId, question, description) {
        let added = new Date();

        let db = global.getService("db");
        db.beginTransaction();
        try {
            // Insert the question into the question table
            let result = await db.insert(questionTable, ["userId", "question", "description", "added", "rating"], [userId, question, description, added.toISOString(), 1]);
            let insertId = result.lastID;
            
            // Do the indexing for the question to show up in search results
            await db.insert(ftsQuestionTable, ["questionId", "question", "description"], [insertId, question, description]);
            
            // Upvote the question automatically for the user's account
            await db.insert(questionVoteTable, ["questionId", "userId", "upVote"], [insertId, userId, 1]);
            db.commitTransaction();
            return insertId;
        } catch (e) {
            db.rollbackTransaction();
        }
        
        return -1;
    };

    this.answer = async function(userId, questionId, answer) {
        let added = new Date();

        let db = global.getService("db");
        db.beginTransaction();
        try {
            // Insert the answer into the answer table
            let result = await db.insert(answerTable, ["userId", "questionId", "answer", "added", "rating"], [userId, questionId, answer, added.toISOString(), 1]);

            // Upvote the answer automatically for the user's account
            await db.insert(answerVoteTable, ["answerId", "userId", "upVote"], [result.lastID, userId, 1]);
            db.commitTransaction();
            return result.lastID;
        } catch (e) {
            db.rollbackTransaction();
            return -1;
        }
    };

    this.updateQuestion = async function(questionId, description) {
        let now = new Date();

        let db = global.getService("db");
        try {
            // Update the question
            let result = await db.update(questionTable, ["description", "updated"], [description, now.toISOString()], ["id"], [questionId]);
            return result.lastID;
        } catch (e) {
            return -1;
        }
    };

    this.updateAnswer = async function(answerId, answer) {
        let now = new Date();

        let db = global.getService("db");
        try {
            // Update the answer
            let result = await db.update(answerTable, ["answer", "updated"], [answer, now.toISOString()], ["id"], [answerId]);
            return result.lastID;
        } catch (e) {
            return -1;
        }
    };

    this.search = async function(term) {
        let db = global.getService("db");
        return await db.fts5(ftsQuestionTable, "*", "question", term);
    };

    this.get = async function(questionId) {
        let db = global.getService("db");
        let result = {
            question: null,
            answers: []
        };

        result.question = await db.get(questionTable, "*", ["id"], [questionId]);
        result.answers = await db.all(answerTable, ["questionId"], [questionId], "`rating` DESC")
        return result;
    };

    this.getQuestion = async function(questionId) {
        let db = global.getService("db");
        return await db.get(questionTable, "*", ["id"], [questionId]);
    };

    this.getAnswer = async function(answerId) {
        let db = global.getService("db");
        return await db.get(answerTable, "*", ["id"], [answerId]);
    };

    this.recent = async function(count) {
        let db = global.getService("db");
        return await db.all(questionTable, [], [], "id DESC", count);
    };

    this.questionVote = async function(userId, questionId, isUpVote) {
        let db = global.getService("db");
        let question = await db.get(questionTable, "*", ["id"], [questionId]);
        if (!question) {
            return false;
        }

        let voteDirection = isUpVote ? 1 : -1;
        let rating = 1 * voteDirection;
        let currentVote = await db.get(questionVoteTable, "*", ["questionId", "userId"], [question.id, userId]);
        if (currentVote) {
            if (currentVote.upVote == isUpVote) {
                return false;
            }

            // We are moving the opposite direction so it needs to be double
            rating *= 2;
        }

        db.beginTransaction();
        try {
            await db.insertReplace(questionVoteTable, ["questionId", "userId", "upVote"], [question.id, userId, isUpVote ? 1 : 0]);
            await db.update(questionTable, ["rating"], [question.rating + rating], ["id"], [question.id]);
            db.commitTransaction();
        } catch (e) {
            db.rollbackTransaction();
            return false;
        }

        return question.rating + rating;
    };

    this.answerVote = async function(userId, answerId, isUpVote) {
        let db = global.getService("db");
        let answer = await db.get(answerTable, "*", ["id"], [answerId]);
        if (!answer) {
            return false ;
        }

        let voteDirection = isUpVote ? 1 : -1;
        let rating = 1 * voteDirection;
        let currentVote = await db.get(answerVoteTable, "*", ["answerId", "userId"], [answer.id, userId]);
        if (currentVote) {
            if (currentVote.upVote == isUpVote) {
                return false;
            }

            // We are moving the opposite direction so it needs to be double
            rating *= 2;
        }

        db.beginTransaction();
        try {
            await db.insertReplace(answerVoteTable, ["answerId", "userId", "upVote"], [answer.id, userId, isUpVote ? 1 : 0]);
            await db.update(answerTable, ["rating"], [answer.rating + rating], ["id"], [answer.id]);
            db.commitTransaction();
        } catch (e) {
            db.rollbackTransaction();
            return false;
        }

        return answer.rating + rating;
    };
};