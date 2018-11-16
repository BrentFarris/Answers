//npm install sqlite3
//npm install bcrypt

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
fs.readdirSync("./routes").forEach(file => {
	var fileName = file.replace(".js", "");

	if (fileName == "index") {
		return;
	}

	app.use(`/${fileName}`, require(`./routes/${fileName}`));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

global.random = function (min, max) {
	return Math.floor(min + (Math.random() * (max - min)));
};

global.count = function (objarr) {
	if (objarr.length) {
		return objarr.length;
	}

	let count = 0;
	for (let key in objarr) {
		if (objarr.hasOwnProperty(key)) {
			count++;
		}
	}

	return count;
};

global.each = function (arr, callback) {
  for (var key in arr) {
		if (!arr.hasOwnProperty(key)) {
			continue;
		}

		if (key === "length" && Object.prototype.toString.call(arr) === "[object HTMLCollection]") {
			continue;
		}

		if (callback(key, arr[key]) === false) {
			break;
		}
  	}
};

global.services = {};
global.registerService = function (serviceName) { let nameParts = serviceName.split("/"); global.services[nameParts[nameParts.length - 1]] = new (require(serviceName))(); };
global.registerServiceObject = function (serviceName, object) { global.services[serviceName] = object; }
global.getService = function (serviceName) { return global.services[serviceName]; };

if (fs.existsSync("./services")) {
	fs.readdirSync("./services").forEach(file => {
		var fileName = file.replace(".js", "");
		global.registerService(`./services/${fileName}`);
	});
}

//global.getService("answers").question(1, "Why is duels not populating with bots anymore?", "");
//global.getService("answers").answer(1, 1, "There is a fallback job for matchmaking that runs every few seconds to fill in the bots for duels if a match is open. The first thing to do to debug this is to deploy to develop/qa which should restart the polling.");

module.exports = app;