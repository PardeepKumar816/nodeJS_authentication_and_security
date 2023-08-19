//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//const encryption = require("mongoose-encryption");
//const md5 = require("md5");
//const bcrypt = require('bcrypt');
//const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encryption, {secret : process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logOut(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
});

app.post("/register", function (req, res) {
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email : req.body.username,
    //         password: hash//md5(req.body.password)
    //     });

    //     newUser.save().
    //     then(value =>{
    //         res.render("secrets");
    //     }).
    //     catch(error =>{
    //         console.log(error);
    //     });
    // });

    User.register({ username: req.body.username }, req.body.password, function (err, result) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function (req, res) {
    // User.findOne({email : req.body.username}).
    // then(foundUser =>{
    //     bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
    //         if(result==true){
    //             res.render("secrets");
    //         }else{
    //             res.send("No user Found");
    //         }
    //     }); 
    // }).
    // catch(error =>{
    //     console.log(error);
    // });

    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.logIn(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });

});

app.listen(3000, function () {
    console.log("Server Started on port 3000");
});