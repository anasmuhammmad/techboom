const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const ejs = require('ejs')
require('dotenv').config()
const app = express();
const path = require('path');


// const session = requuire('express-session'); 

// const userRouter = require('./routers/user.js');
// const adminRouter = require('./routers/admin.js');
const cookieParser = require('cookie-parser')
// const db = require("./config/db")

const mongoose= require('./config/db.js');
 
app.use(session({
    secret: "sample",
    resave: false,
    saveUninitialized: true
}))
app.use(express.static("public"))
app.use(flash());


app.set('view engine', 'ejs')
app.set("views",path.join(__dirname,"views"))

// app.use("/",userRouter)
// app.use('/admin',adminRouter)



app.get('/', function(req,res){
    res.render("user/user-login")
});
app.get('/signup',function(req,res){
    const error = 'An error occured'
    res.render("user/user-signup",{error})
})

app.post('/signup',function(req,res){
    res.render("user/user-signup")
})
const PORT = process.env.PORT

app.listen(PORT, () => 
console.log(`Listening for requests on port${PORT}`));
//     ()=>{
//     console.log("connected successfully");
// })