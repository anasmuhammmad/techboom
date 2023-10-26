const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema');
const otpModel = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
const Category = require('../models/categorySchema');
// const { sendOTPEmail } = require('../config/email'); 
const userOtpVerification = require('../utility/otpFunctions');
const registerUser = require('../utility/registerUser');
const generateOTP = require('../utility/generateOTP');
const sendEmail = require('../utility/sendEmail');
const resendOTP = require('../utility/resendOTP');
const createCart = require('../utility/createCartForUser');
const Product = require('../models/productSchema');
const User = require('../models/userSchema');
const session = require('express-session');
const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
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

// renderHomePage = async (req, res) => {
//   res.render("user/user-shop", { productList, err: "" });
// };

const renderShopPage = async (req, res) => {
  const products = await Product.find();
  const  categories = await Category.find();
  console.log(categories); // Add this line for debugging
  res.render("user/homepage", {products, categories: categories ,productList, err: "" });
};


const productdetails = async(req,res)=>{

  const productId = req.params.productId;
  if (!ObjectId.isValid(productId)) {
    return res.status(404).render('error-404'); // Invalid productId, return a 404 page
  }
  const relatedProducts =await Product.find();
  try {
    // Fetch the product details from the database based on the productId
    const product = await Product.findById(productId);
    const relatedProducts = await Product.find();
    const user = await User.find()

    // If the product is not found, you can handle the error or return a 404 page
    if (!product) {
      return res.status(404); // Create an error-404.ejs template
    }

    // Fetch related products (if needed) - You can define a logic to find related products
    if (product.stock <= 0) {
      // Product is out of stock, display a message
      return res.render('user/user-productDescription', {
        product,
        relatedProducts,
        user,
        outOfStock: true,
      });
    }

    // Render the product details page with dynamic data
    // res.render('user/user-product-details', { product, relatedProducts });
    
    res.render('user/user-productDescription', { product, relatedProducts,user });
  } catch (err) {
    // Handle any errors, e.g., database query error
    console.error(err);
    res.status(500).render('error-500'); // Create an error-500.ejs template
  }
};
const getProfile = async (req, res) => {
const userId = req.session.userId;
const user = await User.findById(userId);
const orderCount = await Order.countDocuments({ UserId: userId });
const cartCount = await Cart.countDocuments({ UserId: userId });
const addressCount = await User.countDocuments();
console.log(req.session.user);
res.render("user/userProfile", {
  user,
  orderCount,
  cartCount,
  addressCount,
});
};
// try {
//   const productId = req.params.productId;
//   const userId=req.session.userId
//   console.log(userId);
//   // if (!req.user) {
//   //   // Redirect or handle cases where the user is not authenticated
//   //   return res.redirect('/login');
//   // }

//   // const userId = req.user._id; // Assuming your user object has an '_id' field

//   // Fetch the user's profile data from the database
//   const user = await User.findById(userId);

//   if (!user) {
//     // Handle the case when the user is not found
//     return res.status(404).send('User not found');
//   }

//   // Render the user's profile template with the user data
//   res.render('user/userProfile', { user });
// } catch (error) {
//   // Handle any errors that might occur during the database query
//   console.error(error);
//   res.status(500).send('An error occurred while fetching user profile');
// }

const renderSignupPage = (req, res) => {
  const error = req.flash('error');

  res.render('user/user-signup', { error });
};

const postSignup = async (req, res) => {
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
  

      const newUser = new User({
        username,
        email,
        password,
        // Other user-specific fields
      });
      const savedUser = await newUser.save();
      createCart(savedUser._id);

    req.session.userData = {
      username, email, password
    };

    // console.log(req.session.email)



    req.flash('success', 'Registration successful. Please check your email for OTP.');

    res.redirect('/otp');


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const renderOtpPage = async (req, res) => {

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
      return res.redirect('/shop');
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
  // if(req.session.userAuth)
  // {
  // res.redirect('/homepage' );
  // }
  // else
  // {
    try {
      res.render('user/user-login', { messages: req.flash('error') });
    } catch (error) {
      
    }


}

const postUserLogin = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    req.session.userId = user._id;
    req.session.user = user;
    console.log("userId",req.session.userId); 
    console.log("user",user);
    console.log("Session data:", req.session);
    if (user) {

      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (passwordMatch) {
        // req.session.userAuth = true;

     
        res.redirect("/homepage");
   
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
const renderHomePage = async(req,res)=>{
  // const user = { Username: 'YourUsername' };
  const userId=req.session.userId;
  const user = req.session.user; 
  console.log("userhome",userId);
  try {

  
    // Use the Mongoose model to find all categories in your database
    const categories = await Category.find();
    const products = await Product.find({status:'Active'});
    

    // Now you can use the retrieved categories in your response
    res.render('user/homepage', { user: user, categories: categories , products});
  } 
  catch (error) {
    // Handle any errors that might occur during the database query
    console.error(error);
    res.status(500).send('An error occurred while fetching categories.');
  }
}
const renderForgotPasswordPage = async (req, res) => {
  const { email } = req.body;
 
  res.render('user/user-forgotPassword', { messages: req.flash(), email });
};

const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    req.session.user = email;
    // Check if a user with the provided email exists in the database
    const user = await UserModel.findOne({ email });

    if (!user) {
      // User not found, handle this case (e.g., show an error message)
      return res.render('user/user-forgotPassword', { error: 'User not found' });
    }
    
    res.redirect('/forgot-otp');



  }catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
   
}
const renderForgotOtpPage = async (req, res) =>
{
  let errorMessages = []; //
  // const otp = req.session.otp || '';
  try {
    // const { email } = req.query;
    const email = req.session.user || '';
    
    // Generate OTP
    const otp = await generateOTP(email);

    // Send email
    await sendEmail(email, otp);

    

    console.log(otp);
    res.render('user/user-OTPloginForgot', { errorMessages, otp: 'Resended OTP' + otp, email }); // Pass OTP to the view
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }


} 
const postForgotOtpVerification = async(req, res) => {

  try {
    const email = req.session.user;
    console.log(email);
    const { typedOTP } = req.body;
    const otpRecord = await otpModel.findOne({ email }).sort({ createdAt: -1 }).exec();
    // const{username, password} =req.session.userData
    if (!otpRecord) {
      req.flash('error', 'OTP record not found');
      return res.redirect('/forgot-otp');   
    }

    const otpMatch = await bcrypt.compare(typedOTP, otpRecord.otp);

    if (otpMatch) {

      console.log(typedOTP);

      // const newUser = await registerUser(username, email, password);
       res.redirect('/shop');
    } else {
      req.flash('error', 'Invalid OTP');
      return res.redirect('/forgot-otp');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};
const   resendForgotOtp = async(req, res) => {


    try {
      const email = req.session.user;
  
      console.log(email);
  
  
      // Generate OTP
      const otp = await resendOTP(email);
  
      // Send email
      await sendEmail(email, otp);
  
      // req.session.otp = otp;
  
      res.redirect(`/forgot-otp`);
  
    } catch (error) {
      console.error(error);
      req.session.errorMessages = ['An error occurred while resending OTP'];
      ; // Redirect with an error message
    }

  }
module.exports = {
  renderShopPage,productdetails, renderOtpPage,getProfile, renderSignupPage, postSignup, postOtpVerification, resendOtp, renderLoginPage,
  postUserLogin, renderHomePage,renderForgotPasswordPage, postForgotPassword,renderForgotOtpPage,postForgotOtpVerification,resendForgotOtp
};