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

var questionForm = document.getElementById("questionForm");
questionForm.onsubmit = function (event) {
    document.getElementById("hiddenQuestion").value = document.querySelector(".ql-editor").innerHTML;
    return true;
}