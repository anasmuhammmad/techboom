const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const ejs = require('ejs');
const app = express();
const path = require('path');
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')
// Import the database connection function
const { connectToDatabase, userModel } = require('./config/db');
const { log } = require('console');

// Load environment variables
require('dotenv').config();



// Middleware
app.use(session({
    secret: "sample",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// mongodb



app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"));
app.use(flash());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use('/', userRouter);
app.use('/', adminRouter);

const PORT = process.env.PORT || 6000;

// Connect to MongoDB before starting the server

    app.listen(PORT, () => {
        console.log(`Listening for requests on port ${PORT}`);
        connectToDatabase().then(() => {
    });
});