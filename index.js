import express from "express";
import bodyParser from "body-parser"; 

const app = express(); 
const port = 3000;

// Config Express
app.set('view engine', 'ejs'); 
app.set('views', './views'); 
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
    console.log(`Listening in port ${port}.`); 
});