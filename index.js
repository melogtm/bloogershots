import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser"; 
import session from 'express-session'; 
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { 
    createUser, isPasswordCorrect, userAlreadyExists, createPost, getUserById, listPosts, deletePost
} from './app/database/dbfuncs.js';

const app = express(); 
const port = 3000;
let posts = await listPosts(); 

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
        const user = await getUserById(id);  

        done(null, user); 
    } catch (error) {
        done(error);
    }
});


app.use(passport.initialize()); 
app.use(passport.session()); 

// Handling Routes - GETs
app.get("/", async (req, res) => {
    if (req.isAuthenticated()) {

        posts = await listPosts(); // Update Posts

        let userInfo; 

        for (let i = 0; i < posts.length; i++) {
            userInfo = await getUserById(posts[i].user_id)

            posts[i]['username'] = userInfo.username; 
        };

        res.render("index", {user: req.user, posts}); 
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

app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        const userId = parseInt(req.query.id); 

        const postsFromUser = posts.filter((post) => post.user_id == userId);
        
        res.render("index", {user: req.user, posts: postsFromUser}); 
    } else {
        res.redirect("/login"); 
    }
});

app.get("/delete", async (req, res) => {
    if (req.isAuthenticated()) {
        const response = await deletePost(parseInt(req.query.id), req.user.id); 

        res.redirect("/");  
    } else {
        res.redirect("/login"); 
    };
});

// Handling Routes - POSTs
app.post("/login", passport.authenticate('local-login', {failureMessage: true, failureRedirect: '/login', successRedirect: '/'}));

app.post("/register", passport.authenticate('local-register', {failureRedirect: '/register', successRedirect: '/login'}));

app.post("/", async (req, res) => {
    const newPost = {
        ...req.body,
        post_date: new Date(),
        user: req.user.id, 
    };

    await createPost(newPost); 

    posts = await listPosts(); 

    res.redirect("/"); 
});

app.listen(port, () => {
    console.log(`Listening in port ${port}.`); 
});