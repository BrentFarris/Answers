var loginForm = document.getElementById("login");
loginForm.onsubmit = function (event) {
    if (this.submited.toLowerCase() === "request account") {
        document.getElementById("info").value = prompt("Put some information for the admin to recognize who you are. Good examples are your email address or your name (which the admin knows you by).", "Steve from accounting steve@example.com");
    }

    return true;
}