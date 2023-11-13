

const express = require('express');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const ejs = require('ejs');
const app = express();
const path = require('path');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const userRouter = require('./routers/user');
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET })
const connectionString = 'mongodb://localhost:27017/your-database-name';
const adminRouter = require('./routers/admin');
// Import the database connection function
const { connectToDatabase, userModel } = require('./config/db');
const { log } = require('console');

// Load environment variables
require('dotenv').config();


// Connect to the database using the existing function
// Create a new instance of MongoDBStore
const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017', // Change this to your MongoDB connection URI
    collection: 'sessions', // Collection name to store sessions
  });
  
  store.on('error', function (error) {
    console.error(error);
  });
  
  // Connect to the database using the existing function
  connectToDatabase();

  app.use(cookieParser());
  app.use(session({
    secret: "sample",
    resave: false,
    saveUninitialized: true,
    store : store,
    // cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }));

 
  app.use(flash());
  app.use('/uploads', express.static('uploads'));
  app.use((req, res, next) => {
    // Set no caching for all routes
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(flash());
  // set view engine
  app.set('view engine', 'ejs');
  app.set("views", path.join(__dirname, "views"));

  //routers 
  app.use('/', userRouter);
  app.use('/', adminRouter);

  const PORT = process.env.PORT || 5000;

  // Start the server
  app.listen(PORT, () => {
    console.log(`Listening for requests on port ${PORT}`);
  });





















// const express = require('express');
// const flash = require('express-flash');
// const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const ejs = require('ejs');
// const app = express();
// const path = require('path');
// const jwt = require("jsonwebtoken");
// const cookieParser = require('cookie-parser');
// const userRouter = require('./routers/user')

// const connectionString = 'mongodb://localhost:27017/your-database-name';
// const adminRouter = require('./routers/admin')
// // Import the database connection function
// const { connectToDatabase, userModel } = require('./config/db');
// const { log } = require('console');





// // Load environment variables
// require('dotenv').config();
// const store = new MongoDBStore({
//     uri: 'mongodb://localhost:27017', // MongoDB connection URI
//     collection: 'sessions', // Collection to store sessions
//   });




// connectToDatabase().then(() => {
// app.use(cookieParser());
// app.use(session({
//     // store: new RedisStore({ client: redisClient }),
//     secret: "sample",
//     resave: false,
//     saveUninitialized: true,
   
//     // cookie: { maxAge: 24 * 60 * 60 * 1000 },
// }));

// app.use(flash());
// app.use('/uploads', express.static('uploads'));
// app.use((req, res, next) => {
//     // Set no caching for all routes
//     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//     next();
//   });


// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// app.use(flash());
// // set view engine
// app.set('view engine', 'ejs');
// app.set("views", path.join(__dirname, "views"));

// //routers 
// app.use('/', userRouter);
// app.use('/', adminRouter);


// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB before starting the server

//     app.listen(PORT, () => {
//         console.log(`Listening for requests on port ${PORT}`);
//         connectToDatabase().then(() => {
//     });
// });

// });
