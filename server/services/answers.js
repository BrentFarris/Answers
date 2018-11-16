const questionTable = "Questions";
const ftsQuestionTable = "VirtualQuestions";
const answerTable = "Answers";

module.exports = function() {
    this.question = async function(userId, question, description) {
        let db = global.getService("db");
        db.beginTransaction();
        try {
            let result = await db.insert(questionTable, ["userId", "question", "description"], [userId, question, description]);
            let insertId = result.lastID;
            await db.insert(ftsQuestionTable, ["questionId", "question", "description"], [insertId, question, description]);
            db.commitTransaction();
            return insertId;
        } catch (e) {
            db.rollbackTransaction();
        }
        
        return -1;
    };

    this.answer = async function(userId, questionId, answer) {
        let db = global.getService("db");
        try {
            let result = await db.insert(answerTable, ["userId", "questionId", "answer"], [userId, questionId, answer]);
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

    this.recent = async function(count) {
        let db = global.getService("db");
        return await db.all(questionTable, [], [], "id DESC", count);
    };
};