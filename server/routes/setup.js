var express = require('express');
var router = express.Router();
const fs = require('fs');

router.get('/', async function(req, res, next) {
    if (!fs.existsSync("setup.txt")) {
        return res.redirect("/");
    }

	res.render("setup", { title: "Setup" });
});

router.post("/", async function(req, res, next) {
    if (!fs.existsSync("setup.txt")) {
        return res.redirect("/");
    }

    let username = req.body.username;
    let password = req.body.password;
    
    fs.unlinkSync("setup.txt", (e) => { console.log(e); });
    let result = await global.getService("account").create(username, password, false, true);

    if (result === false) {
        return res.send("There was a problem creating the admin, please try again. <a href='/'>Return Home</a>");
    } else if (result !== null) {
        return res.send(`${result}. <a href='/'>Return Home</a>`);
    }

    return res.send(`You have completed the setup. <a href='/'>Return Home</a>`);
});

module.exports = router;