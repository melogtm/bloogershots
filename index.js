import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser"; 
import session from 'express-session'; 
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { createUser, isPasswordCorrect, userAlreadyExists } from './app/database/dbfuncs.js';
import query from './app/database/db.js';

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

// How Passport should handle Registration 
passport.use("local-register", new LocalStrategy(async (username, password, done) => {
    try {
        const userExists = await userAlreadyExists(username); 

        if (userExists) {
            return done(null, false); 
        }

        const newbie = await createUser(username, password); 
        return done (null, newbie); 
    } catch (error) {
        done(error); 
    }
}));
// How Passport should handle LogIn
passport.use("local-login", new LocalStrategy(async (username, password, done) => {
    try {
        const user = await userAlreadyExists(username); 

        if (!user) {
            return done(null, false, {message: 'Invalid Username or Password!'}); 
        };

        const matchPass = await isPasswordCorrect(password, user.pass); 

        if (!matchPass) return done(null, false, {message: 'Invalid Username or Password!'}); 
        return done(null, user); 
    } catch (error) {
        done(error); 
    }
}));

// Serialize and deserialize for sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userById = await query("SELECT * FROM users WHERE id = $1", [id]);

        const user = userById.rows[0]; 

        done(null, user); 
    } catch (error) {
        done(error);
    }
});


app.use(passport.initialize()); 
app.use(passport.session()); 

// Handling Routes - GETs
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("index"); 
    } else {
        res.redirect("/login"); 
    }
});

app.get("/login", (req, res) => {
    const errorMessage = req.session['messages'] ? req.session['messages'][0] : false; 

    res.render("login", {err: errorMessage});
});

app.get("/register", (req, res) => {
    res.render("register"); 
});

app.get("/logout", (req, res) => {
    res.clearCookie("connect.sid"); 

    req.logOut(() => {
        res.redirect("/login"); 
    });
});

// Handling Routes - POSTs
app.post("/login", passport.authenticate('local-login', {failureMessage: true, failureRedirect: '/login', successRedirect: '/'}));

app.post("/register", passport.authenticate('local-register', {failureRedirect: '/register', successRedirect: '/login'}));

app.listen(port, () => {
    console.log(`Listening in port ${port}.`); 
});