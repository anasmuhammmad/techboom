const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const crypto = require('crypto');
const otpModel = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
const userOtpVerification = require('../utility/otpFunctions');
const userController = require('../controllers/userController');
const Category = require('../models/categorySchema');
const Product = require('../models/productSchema');
const Brand = require('../models/brandSchema');
const User = require('../models/userSchema');
const Cart = require('../models/cartSchema');
const razorpay = require("../utility/razorpay");
const Order = require('../models/orderSchema');
const Coupon = require('../models/couponSchema');
const couponController = require('../controllers/couponController');
const Transaction = require('../models/transactionSchema'); 
const moment = require('moment');
// product list

// router.get('/homep',async(req,res)=>{
//   const user = { Username: 'YourUsername' }; 
//   const categories = [name  : 'Category'];
//   res.render('user/homepage',{user : user,categories : categories});
// })
// Routes
const mongoose = require('mongoose');

// Create a new ObjectId
// const objectId = new mongoose.Types.ObjectId();

// Example usage in your Cart:
// const sampleCart = new Cart({
//   UserId: '65240a79ea2b5820475f6a74', // Use the generated ObjectId here
//   Items: [
//     {
//       ProductId: '652cc93432547de3bad122c4', // Use the generated ObjectId here
//       Quantity: 1,
//     },
//     // Add more items if needed
//   ],
//   TotalAmount: 30000,
// });

// // Save the cart to the database
// sampleCart.save()
//   .then(() => {
//     console.log('Sample cart saved to the database.');
//   })
//   .catch((error) => {
//     console.error('Error saving sample cart:', error);
//   });

// router.get('/homepage', async (req, res) => {
//   const user = await User.find()
//   const categories = await Category.find()
//   const brands = await Brand.find();
//   const products = await Product.find();
//   const currentPage = req.query.page || 1; // Assuming 'page' is passed as a query parameter
//   const perPage = 10  
//   const totalCount = products.length; // Calculate the total count based on the products array
//   const totalPages = Math.ceil(totalCount / perPage);
//   res.render('user/shop', {user,categories,brands,products,currentPage, perPage,totalCount,totalPages}); //  
// })
// Import your cart model


// async function createCartsForExistingUsers() {
//   try {
//     const users = await User.find({}).exec();
    
//     for (const user of users) {
//       const newCart = new Cart({
//         UserId: user._id, // Set the UserId to match the user's ID
//         // Other cart-specific data like Items and TotalAmount
//       });
      
//       await newCart.save(); // Use await to save the cart
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }


// createCartsForExistingUsers();
// function createCartForUser(userId) {
//   const newCart = new Cart({
//     UserId: userId, // Set the UserId to match the user's ID
//     // Other cart-specific data like Items and TotalAmount
//   });

//   // Save the new cart document to the database
//   newCart.save((err, cart) => {
//     if (err) {
//       console.error(err);
//     } else {
//       // At this point, a cart document has been created for the user
//     }
//   });
// }








router.get('/profile',userController.getProfile)




router.get('/', userController.renderHomePage);
router.get('/shop',userController.renderShopPage);
router.get('/productdetails/:productId',userController.productdetails)




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
  router.get('/homepage',userController.renderHomePage)


  router.get('/product/:productId', userController.products);

  router.get('/cart', userController.getCart);
router.post('/cart',userController.postCart);


router.get('/addtocart/:_id',userController.getAddToCart);
router.get('/trackOrder', userController.trackOrder);

router.get('/orderList', userController.orderList)

router.get('/order/cancel/:_id',userController.orderCancel)
    // } else {
    //   console.log('Cannot Cancel Order. Status:', order.Status); // Add this line for debugging
    //   return res.status(400).send('Order cannot be cancelled');
    // }
router.get('/order/details/:_id',userController.orderDetails )

router.get('/editAddress',userController.getEditAddress);
router.post('/editAddress/:_id',userController.postEditAddress)
router.post('/changePassword', userController.changePassword)


// router.post('/changePassword', async (req, res) => {
//   const userId = req.session.userId;
//   console.log("Inside change password");
//   const user = await User.findById(userId);
//   try {
//     const dbPassword = user.password;
//     console.log(req.body);
//     console.log('dbPassword:', dbPassword); // Check if dbPassword is correctly retrieved
// console.log('req.body.newPassword:', req.body.newPassword); // Check the new password
//     let passwordIsValid = bcrypt.compare(req.body.newPassword, dbPassword);
//     console.log('passwordIsValid:', passwordIsValid); 
//     if (passwordIsValid) {
//       res.json({ error: "New Password cannot be the same as the current one" });
//     } else if (req.body.newPassword === req.body.confirmPassword) {
//       let passwordHashed = bcrypt.hashSync(req.body.newPassword, 8);
//       const result = await User.updateOne(
//         { _id: userId },
//         { $set: { password: passwordHashed } },
//         { new: true }
//       );
//       res.json({
//         success: true,
//         message: "Password changed successfully",
//       });
//     } else {
//       res.json({ error: "Current Password is incorrect" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, error: "Password change failed" });
//   }
// })

router.post('/addAddress',userController.addAddress)


router.post('/updateQuantity',userController.updateQuantity)

router.get('/removefromcart/:_id',userController.removeCart)


// router.get('/checkstock', async (req, res) => {
//   try {
//     const productsData = req.body; // Assuming it's an array of product data

//     const stockStatus = [];

//     for (const productData of productsData) {
//       // You may want to validate the productData structure here
//       // Ensure it contains a productId and quantity, and validate them as needed

//       // Query the product with the specified product ID
//       const product = await Product.findOne({ _id: productData.productId });

//       if (product) {
//         const availableQuantity = product.stock;
//         const requestedQuantity = productData.quantity;

//         if (availableQuantity >= requestedQuantity) {
//           stockStatus.push({ productId: product._id, success: true });
//         } else {
//           stockStatus.push({ productId: product._id, success: false, error: 'Insufficient stock' });
//         }
//       } else {
//         // Product not found
//         stockStatus.push({ productId: productData.productId, success: false, error: 'Product not found' });
//       }
//     }

//     res.status(200).json(stockStatus);
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });

router.get('/checkout',userController.getCheckout)

router.post('/checkout',userController.postCheckout)
router.post('/addAddress-Checkout',userController.addAddressCheckout)
// router.post('/verify-payment',userController.verifyPayment) 

router.post('/checkCoupon',couponController.checkCoupon)

// router.post('/transactions', async (req, res) => {
//   try {
//     const { userId, type, amount, description } = req.body;
//     const transaction = new Transaction({ userId, type, amount, description });
//     await transaction.save();

//     res.status(201).json(transaction);
//   } catch (error) {
//     res.status(500).json({ error: 'Error creating transaction' });
//   }
// });

router.get('/orderSuccess', userController.orderSuccess);

  

  router.get('/forgotPassword', userController.renderForgotPasswordPage);
  router.post('/forgotPassword',userController.postForgotPassword);

  router.get('/forgot-otp', userController.renderForgotOtpPage);
  router.post('/forgot-otp', userController.postForgotOtpVerification);
  router.get('/forgot-resend-otp', userController.resendForgotOtp);




router.get('/usershop', function (req, res) {
  // Replace this with the actual product list data
  const productList = [
    { name: 'Product 1', description: 'Description 1', price: 10.99 },
    { name: 'Product 2', description: 'Description 2', price: 19.99 },
    // Add more products here
  ];

  res.render('user/user-shop', { productList });
});

router.get('/logout',async (req, res) => {
  // req.session.userAuth = false;
  res.redirect('/login');
})

module.exports = router;







