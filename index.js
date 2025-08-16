var express = require("express");   
var bodyparser = require("body-parser");
var user = require("./routes/user");
var admin = require("./routes/admin");
var upload = require("express-fileupload");
var session = require("express-session")


var app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(express.static('public'));
app.use(session({
    secret:"abcdefghijklmnopqrstuvwxyz",
    resave:true,
    saveUninitialized:true,
}));


app.use("/",user);
app.use("/admin",admin);



app.listen(1000);
