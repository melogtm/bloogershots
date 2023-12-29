import express from "express";
import bodyParser from "body-parser"; 

const app = express(); 
const port = 3000;
let posts = []

app.set('view engine', 'ejs'); 
app.set('views', './views'); 
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));

let id = 1; 

function createPost(req, res, next) {
    
    if (req.body["title"]) {
        // Checar se há um post com um id (num) já existente, caso haja, incremente-o e realize uma nova checagem, até achar um id único.
        let seekForDuplication = posts.find((post) => post.num == id);

        while (seekForDuplication) {
            id++; 
            seekForDuplication = posts.find((post) => post.num == id);
        }

        posts.push({num: id, title: req.body["title"], blog: req.body["text"]});
    }
    next(); 
}

app.use(createPost); 

app.get("/", (req, res) => {
    res.render("index.ejs", {posts: posts});
});

app.get("/create", (req, res) => {
    res.render("create-page.ejs", {postEdit: posts.find((post) => post.num == req.params.num)});
});

app.get("/post/:num", (req, res) => {
    res.render("blog.ejs", {postNum: req.params.num, posts}); 
});

app.get("/delete/:num", (req, res) => {
    const perilPost = posts.find((post) => post.num == req.params.num); 

    posts.splice(posts.indexOf(perilPost), 1);

    res.redirect("/"); 
});

app.get("/edit/:num", (req, res) => {
    res.render("create-page.ejs", {postEdit: posts.find((post) => post.num == req.params.num)}); 
});

app.post("/create", (req, res) => {
    res.redirect("/"); 
});

app.post("/edit/:num", (req, res) => {
    let postIndex = posts.findIndex((post) => post.num == req.params.num);

    posts[postIndex].title = req.body['title'];
    posts[postIndex].blog = req.body['text']; 

    posts.splice(postIndex, 1);

    res.redirect("/"); 

});

app.listen(port, () => {
    console.log(`Listening in port ${port}.`); 
});