const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema'); 
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
// product list
const productList = [
    { name: 'Product 1', description: 'Description 1', price: 10.99 },
    { name: 'Product 2', description: 'Description 2', price: 19.99 },
    
  ];

// Routes
app.get('/', async(req, res) => {
       
 
          res.render("user/user-shop",{productList, err:""});
        }
      
); 
app.get('/shop', async(req,res)=>{
  res.render("user/user-shop",{productList, err:""});
})
app.get('/otp',async (req, res) => {
  res.render('user/user-otpveri')
 }
 );
app.get('/signup', function (req, res) {
    const error = '';

    res.render("user/user-signup", { error });
});


app.post('/signup', async (req, res) => {
  try {
    // Extract user data from the request body
    const { username, email, password, confirmPassword} = req.body;

    
    // Check if required fields are provided
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

        // Check if password and confirm password match
        if (password !== confirmPassword) {
          return res.render("user/user-signup", { error: 'Password and confirm password do not match' });
        }


         // Generate a salt for hashing
    const saltRounds = 10; // You can adjust the number of rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds); 

    // Create a new user record in the database
    const newUser = await UserModel.create({ username, email, password:hashedPassword });

    res.redirect('/otp')
    // Send a success response
    // res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    // Handle errors, e.g., validation errors or database errors
    console.error(error);
    res.status(500).json({ error: 'Error signing up user' });
  }
});
 
// nodemailer

  // const mailOptions = {
  //   from: 'techboompage@gmail.com',
  //   to: 'anasmuhammed444@gmail.com',
  //   subject: 'Hello, this is a test email',
  //   text: 'This is the email body text.',
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.error('Error sending email:', error);
  //     // res.status(500).json({ error: 'Error sending email' });
  //   } else {
  //     console.log('Email sent successfully:', info.response);
  //     // res.status(200).json({ message: 'Email sent successfully' });
  //   }
  // });








app.post('/otp', async(req,res)=>{
  try {
    
  } catch (error) {
    
  }
})



app.get('/login',async (req, res) => {
  res.render('user/user-login')
 }
 );
app.get('/usershop', function (req, res) {
    // Replace this with the actual product list data
    const productList = [
        { name: 'Product 1', description: 'Description 1', price: 10.99 },
        { name: 'Product 2', description: 'Description 2', price: 19.99 },
        // Add more products here
    ];

    res.render('user/user-shop', { productList });
});

module.exports =app;