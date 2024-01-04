import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser"; 
import session from 'express-session'; 
import passport from 'passport';

const app = express(); 
const port = 3000;

// Config Express
app.set('view engine', 'ejs'); 
app.set('views', './views'); 
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));

// Config Sessions 
app.use(session({
    secret: process.env.SECRETPHRASE, 
    resave: false,
    saveUninitialized: false, 
    cookie: {
        maxAge: 3600000
    }
}));

app.use(passport.initialize()); 
app.use(passport.session()); 

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register"); 
});

app.listen(port, () => {
    console.log(`Listening in port ${port}.`); 
});