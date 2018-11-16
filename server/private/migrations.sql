CREATE TABLE `Accounts` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`username`	TEXT NOT NULL UNIQUE,
	`hash`	TEXT NOT NULL,
	`session`	TEXT UNIQUE,
	`verified`	INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE `Questions` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`userId`	INTEGER NOT NULL,
	`question`	TEXT NOT NULL UNIQUE,
	`description`	TEXT NOT NULL,
	`rating`	INTEGER NOT NULL DEFAULT 0,
	`added`	TEXT,
	`updated`	TEXT,
	FOREIGN KEY(`userId`) REFERENCES `Accounts`(`id`)
);

CREATE TABLE `Answers` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`userId`	INTEGER NOT NULL,
	`questionId`	INTEGER NOT NULL,
	`answer`	TEXT NOT NULL,
	`rating`	INTEGER NOT NULL DEFAULT 0,
	`approved`	INTEGER NOT NULL DEFAULT 0,
	`added`	TEXT,
	`updated`	TEXT,
	FOREIGN KEY(`questionId`) REFERENCES `Questions`(`id`),
	FOREIGN KEY(`userId`) REFERENCES `Accounts`(`id`)
);

CREATE VIRTUAL TABLE `VirtualQuestions` USING FTS5(`questionId`, `question`, `description`);

CREATE TABLE `AnswerVotes` (
	`answerId`	INTEGER NOT NULL,
	`userId`	INTEGER NOT NULL,
	`upVote`	INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY(`userId`) REFERENCES `Accounts`(`id`),
	FOREIGN KEY(`answerId`) REFERENCES `Answers`(`id`),
	PRIMARY KEY(`answerId`,`userId`)
);

CREATE TABLE `QuestionVotes` (
	`questionId`	INTEGER NOT NULL,
	`userId`	INTEGER NOT NULL,
	`upVote`	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY(`userId`,`questionId`),
	FOREIGN KEY(`userId`) REFERENCES `Accounts`(`id`),
	FOREIGN KEY(`questionId`) REFERENCES `Questions`(`id`)
);