const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema');
const otpModel = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
const userOtpVerification = require('../utility/otpFunctions');
const userController = require('../controllers/userController')
// product list


// Routes
router.get('/', userController.renderHomePage);
router.get('/shop', userController.renderShopPage);
router.get('/productdetails',userController.productdetails)


router.get('/signup', userController.renderSignupPage);
router.post('/signup', userController.postSignup);


router.get('/otp', userController.renderOtpPage);
router.post('/otp', userController.postOtpVerification)
router.get('/resend-otp', userController.resendOtp)

// app.get('/resend-otp', (req, res) => {
//   // Handle the GET request logic here
//   res.render('This is the resend OTP page');
// });

  router.get('/login', userController.renderLoginPage)
  router.post('/login',userController.postUserLogin)
  router.get('/forgotPassword', userController.renderForgotPasswordPage);
  router.post('/forgotPassword',userController.postForgotPassword)



router.get('/usershop', function (req, res) {
  // Replace this with the actual product list data
  const productList = [
    { name: 'Product 1', description: 'Description 1', price: 10.99 },
    { name: 'Product 2', description: 'Description 2', price: 19.99 },
    // Add more products here
  ];

  res.render('user/user-shop', { productList });
});

module.exports = router;







