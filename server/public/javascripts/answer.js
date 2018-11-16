var quill = new Quill("#answer", {
    theme: "snow",
    modules: {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['link', 'image', 'video', 'formula'],


                ['clean']                                         // remove formatting button
            ],
            handlers: {
                image: imageHandler
            }
        }
    }
});

function imageHandler() {
    var range = this.quill.getSelection();
    var value = prompt('What is the image URL');
    this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
}

var answerForm = document.getElementById("answerForm");
answerForm.onsubmit = function (event) {
    document.getElementById("hiddenAnswer").value = document.querySelector(".ql-editor").innerHTML;
    return true;
}

function questionVote(isUpVote) {
    http.post("/answer/vote/question", {
        vote: isUpVote,
        id: document.getElementById("questionId").value
    }).then(function(response) {
        var questionContainer = document.getElementById("question");
        questionContainer.querySelector(".rating").textContent = "[" + response.rating + "] ";
    });
}

function answerVote(answerId, isUpVote) {
    http.post("/answer/vote/answer", {
        vote: isUpVote,
        id: answerId
    }).then(function(response) {
        var answerContainer = document.getElementById("answer-" + answerId);
        answerContainer.querySelector(".rating").textContent = "[" + response.rating + "] ";
    });
}