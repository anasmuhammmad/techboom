const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema');
const otpModel = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
const userOtpVerification = require('../utility/userOtpVerification');
// product list
const productList = [
  { name: 'Product 1', description: 'Description 1', price: 10.99 },
  { name: 'Product 2', description: 'Description 2', price: 19.99 },

];

// Routes
app.get('/', async (req, res) => {


  res.render("user/user-shop", { productList, err: "" });
}

);
app.get('/shop', async (req, res) => {
  res.render("user/user-shop", { productList, err: "" });
})
app.get('/otp', async (req, res) => {
  const errorMessages = req.flash('error');
  res.render('user/user-otpveri', { errorMessages });
}
);
app.get('/signup', function (req, res) {
  const error = req.flash('error');

  res.render('user/user-signup', { error });
});


app.post('/signup', async (req, res) => {
  try {
    // Extract user data from the request body
    const { username, email, password, confirmPassword } = req.body;


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
    const newUser = await UserModel.create({ username, email, password: hashedPassword });

    // generate OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    // Hash the OTP using bcrypt before saving
     
    const hashedOTP = await bcrypt.hash(otp, saltRounds);


    // Save the OTP to the database
    const newOTP = await otpModel.create({ email, otp: hashedOTP });


    // send the otp to provided email
    const duration = "  14 minutes";
    const message = "Enter This OTP to Continue";
    const mailOptions = {
      from: 'techboompage@gmail.com',
      to: req.body.email,
      subject: 'verify your email',
      text: otp,
      html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otp}</b></p><p>This Code <b>expires in ${duration} minutes(s)</b>.</p>`,
    };
    console.log('Generated OTP', otp);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
      } else {
        console.log('Email sent successfully:', info.response);
        res.redirect('/otp'); // Redirect to the /otp page after sending OTP
      }
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



app.post('/otp', async (req, res) => {
  try {
    const { typedOTP, email } = req.body;

    // Find the OTP record in the database based on the provided email
    const otpRecord = await otpModel.findOne({ email });

    if (!otpRecord) {
      req.flash('error', 'OTP record not found');
      return res.redirect('/otp'); // Redirect back to the OTP page

    }

    // Compare the typed OTP with the stored OTP
    const otpMatch =  await bcrypt.compare(typedOTP, otpRecord.otp);

    if (otpMatch) {
      // If OTP is valid, you can redirect the user to the shop page
      console.log(typedOTP);
      return res.redirect('/usershop');
    } else {
      req.flash('error', 'Invalid OTP');
      return res.redirect('/otp'); // Redirect back to the OTP page
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }

  //   // Compare the typed OTP with the stored hashed OTP
  //   const otpMatch = await bcrypt.compare(typedOTP, otpRecord.otp);

  //   if (!otpMatch) {
  //     return res.status(400).json({ error: 'Invalid OTP' });
  //   }

  //   // If OTP is valid, you can redirect the user to the shop page
  //   res.redirect('/shop');
  // }
});



app.get('/login', async (req, res) => {
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

module.exports = app;