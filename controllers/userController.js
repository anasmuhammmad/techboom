const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema');
const otpModel = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
// const { sendOTPEmail } = require('../config/email'); 
const userOtpVerification = require('../utility/otpFunctions');
const registerUser = require('../utility/registerUser');
const generateOTP = require('../utility/generateOTP');
const sendEmail = require('../utility/sendEmail');
const resendOTP = require('../utility/resendOTP');

const session = require('express-session');
const flash = require('express-flash');
// const generateAndSendOTP = async (email) => {
//   try {
//     const saltRounds = 10;
//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//     const hashedOTP = await bcrypt.hash(otp, saltRounds);
//     const newOTP = await otpModel.create({ email, otp: hashedOTP });

//     const duration = '  14 minutes';
//     const message = 'Enter This OTP to Continue';
//     const mailOptions = {
//       from: 'techboompage@gmail.com',
//       to: email,
//       subject: 'Verify your email',
//       text: otp,
//       html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otp}</b></p><p>This Code <b>expires in ${duration} minutes(s)</b>.</p>`,
//     };

//     console.log('Generated OTP', otp);
//     transporter.sendMail(mailOptions, (error, info) => {

//             if (error) {
//           console.error('Error sending email:', error);
//           res.status(500).json({ error: 'Error sending email' });
//         } else {
//           console.log('Email sent successfully:', info.response);
//           res.redirect('/otp');
//         }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };




const productList = [
  { name: 'Product 1', description: 'Description 1', price: 10.99 },
  { name: 'Product 2', description: 'Description 2', price: 19.99 },
];

renderHomePage = async (req, res) => {
  res.render("user/user-shop", { productList, err: "" });
};

renderShopPage = async (req, res) => {
  res.render("user/user-shop", { productList, err: "" });
};


const productdetails = async(req,res)=>{

  const productData = {
    name: 'GIGABYTE pci_e_x16 GeForce RTX 3050 Gaming OC 8G Graphics Card',
    description: 'Industry Leading High Perfomance Graphics Car...',
    // Add more product data here
  };

  res.render('user/user-product-details')
}


renderSignupPage = (req, res) => {
  const error = req.flash('error');

  res.render('user/user-signup', { error });
};

postSignup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
   
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password !== confirmPassword) {
      req.flash('error', { password: { message: 'Password and confirm password do not match' } });
      return res.redirect("/signup");
    }

       // Check if the email already exists in the database
       const userExists = await UserModel.findOne({ email });
       if (userExists) {
        req.flash('error', 'User with this email already exists');
        return res.render("user/user-signup", { error: req.flash('error') });
      }
  

    req.session.userData = {
      username, email, password
    };

    console.log(req.session.email)


    req.flash('success', 'Registration successful. Please check your email for OTP.');

    res.redirect('/otp');


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

renderOtpPage = async (req, res) => {

  let errorMessages = []; //
  // const otp = req.session.otp || '';
  try {
    // const { email } = req.query;
    const email = req.session.userData.email || '';
    // Generate OTP
    const otp = await generateOTP(email);

    // Send email
    await sendEmail(email, otp);

    req.session.email = email;

    console.log(otp);
    res.render('user/user-otpveri', { errorMessages, otp: 'Resended OTP' + otp, email }); // Pass OTP to the view
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }

  // const errorMessages = req.flash('error');
  // res.render('user/user-otpveri', { errorMessages });
};

const resendOtp = async (req, res) => {
  try {
    const email = req.session.userData.email;




    // Generate OTP
    const otp = await resendOTP(email);

    // Send email
    await sendEmail(email, otp);

    // req.session.otp = otp;

    res.redirect(`/otp`);

  } catch (error) {
    console.error(error);
    req.session.errorMessages = ['An error occurred while resending OTP'];
    ; // Redirect with an error message
  }
};

const postOtpVerification = async (req, res) => {
  try {
    const email = req.session.userData.email;
    const { typedOTP } = req.body;
    const otpRecord = await otpModel.findOne({ email }).sort({ createdAt: -1 }).exec();
    const{username, password} =req.session.userData
    if (!otpRecord) {
      req.flash('error', 'OTP record not found');
      return res.redirect('/otp');
    }

    const otpMatch = await bcrypt.compare(typedOTP, otpRecord.otp);

    if (otpMatch) {

      console.log(typedOTP);

      const newUser = await registerUser(username, email, password);
      return res.redirect('/login');
    } else {
      req.flash('error', 'Invalid OTP');
      return res.redirect('/otp');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};




const renderLoginPage = async (req, res) => {
  res.render('user/user-login', { messages: req.flash('error') });
}

const postUserLogin = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (passwordMatch) {
        res.redirect("/shop");
      } else {
        req.flash('error', 'Invalid username or password');
        res.redirect("/login");
      }
    } else {
      req.flash('error', 'Invalid username or password');
      res.redirect("/login");
    }
  } catch (error) {
    req.flash('error', 'Invalid username or password');
    res.redirect("/login");
  }
};

const renderForgotPasswordPage = async (req, res) => {
  const { email } = req.body;
  res.render('user/user-forgotPassword', { messages: req.flash(), email });
};

const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if a user with the provided email exists in the database
    const user = await UserModel.findOne({ email });

    if (!user) {
      // User not found, handle this case (e.g., show an error message)
      return res.render('user/user-forgotPassword', { error: 'User not found' });
    }

    // Generate an OTP and save it to the database
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    // Save the OTP to the OTP model (you should have an OTP schema)
    await otpModel.create({ email, otp: hashedOTP });

    // Send the OTP to the user's email address (you can use nodemailer for this)
    const duration = '  14 minutes';
    const message = 'Enter This OTP to Continue';
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
        res.redirect('/otp');
      }
    });



    // Redirect to a confirmation page or show a success message
    res.render('user/user-OTPloginForgot', { email });
  } catch (error) {
    console.error(error);
    // Handle errors appropriately (e.g., show an error message)
    res.render('user/user-forgotPassword', { error: 'An error occurred' });
  }
}



module.exports = {
  renderHomePage, renderShopPage,productdetails, renderOtpPage, renderSignupPage, postSignup, postOtpVerification, resendOtp, renderLoginPage,
  postUserLogin, renderForgotPasswordPage, postForgotPassword
}









