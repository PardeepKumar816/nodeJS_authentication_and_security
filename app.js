//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
//const encryption = require("mongoose-encryption");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encryption, {secret : process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User", userSchema);



app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register", function(req,res){
    const newUser = new User({
        email : req.body.username,
        password: md5(req.body.password)
    });

    newUser.save().
    then(value =>{
        res.render("secrets");
    }).
    catch(error =>{
        console.log(error);
    });
});

app.post("/login", function(req, res){
    User.findOne({email : req.body.username}).
    then(foundUser =>{
        if(foundUser.password === md5(req.body.password)){
            res.render("secrets");
        }else{
            res.send("No user Found");
        }
    }).
    catch(error =>{
        console.log(error);
    });
});

app.listen(3000,function(){
    console.log("Server Started on port 3000");
});