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
const userAuth = require('../middlewares/userAuth')
const cron = require('../utility/cron');
const Offer = require('../models/offerSchema');

// product list

// router.get('/homep',async(req,res)=>{
//   const user = { Username: 'YourUsername' }; 
//   const categories = [name  : 'Category'];
//   res.render('user/homepage',{user : user,categories : categories});
// })
// Routes
const mongoose = require('mongoose');





router.get('/home',)

router.get('/profile',userController.getProfile)




// router.get('/', userController.renderHomePage);
// router.get('/shop',userController.renderShopPage);
router.get('/productdetails/:productId', auth.userauthMiddleware,userController.productdetails)

router.get('/shop', auth.userauthMiddleware,userController.getShop)
router.post('/search-product', auth.userauthMiddleware,userController.getSearch)
router.get('/category/:_id',auth.userauthMiddleware,userController.getShop)

// Route for handling AJAX/JSON requests


router.get('/signup', userController.renderSignupPage);
router.post('/signup', userController.postSignup);

router.get('/signup/:_id', userController.getUserSignupWithReferralCode)





router.get('/otp', userController.renderOtpPage);
router.post('/otp', userController.postOtpVerification)
router.get('/resend-otp', userController.resendOtp)



  router.get('/login', userController.renderLoginPage)
  router.post('/login',userController.postUserLogin)
  router.get('/logout',userController.logout);
  router.get('/homepage',userController.renderHomePage)
  

  router.get('/product/:productId',auth.userauthMiddleware, userController.products);

  router.get('/cart',auth.userauthMiddleware, userController.getCart);
router.post('/cart',auth.userauthMiddleware,userController.postCart);


router.get('/addtocart/:_id',auth.userauthMiddleware,userController.getAddToCart);
router.get('/trackOrder', auth.userauthMiddleware,userController.trackOrder);

router.get('/orderList',auth.userauthMiddleware, userController.orderList)

router.get('/order/cancel/:_id',auth.userauthMiddleware,userController.orderCancel)
    // } else {
    //   console.log('Cannot Cancel Order. Status:', order.Status); // Add this line for debugging
    //   return res.status(400).send('Order cannot be cancelled');
    // }
router.get('/order/details/:_id',auth.userauthMiddleware,userController.orderDetails)
router.post('/order/return/:_id',auth.userauthMiddleware,userController.returnOrder)


// router.post('/download-invoice',auth.userauthMiddleware,userController.downloadInvoice)
router.get('/download-invoice/:orderId',auth.userauthMiddleware,userController.downloadInvoice)

router.post('/download-invoice',auth.userauthMiddleware,userController.downloadInvoice)
router.get('/download-invoice/:orderId',auth.userauthMiddleware,userController.downloadfile)


router.get('/editAddress',auth.userauthMiddleware,userController.getEditAddress);
router.post('/editAddress/:_id',auth.userauthMiddleware,userController.postEditAddress)
router.post('/changePassword',auth.userauthMiddleware, userController.changePassword)



router.post('/addAddress',auth.userauthMiddleware,userController.addAddress)


router.post('/updateQuantity',auth.userauthMiddleware,userController.updateQuantity)

router.get('/removefromcart/:_id',auth.userauthMiddleware,userController.removeCart)



router.get('/checkout',auth.userauthMiddleware,userController.getCheckout)

router.post('/checkout',auth.userauthMiddleware,userController.postCheckout)

router.post('/verify-payment',auth.userauthMiddleware,userController.verifyPayment)
router.post('/addAddress-Checkout',auth.userauthMiddleware,userController.addAddressCheckout)


router.post('/checkCoupon',auth.userauthMiddleware,couponController.checkCoupon)

router.get('/coupons',auth.userauthMiddleware,couponController.getCoupons)

router.get('/orderSuccess', auth.userauthMiddleware,userController.orderSuccess);

  

  router.get('/forgotPassword', userController.renderForgotPasswordPage);
  router.post('/forgotPassword',userController.postForgotPassword);

  router.get('/forgot-otp', userController.renderForgotOtpPage);
  router.post('/forgot-otp', userController.postForgotOtpVerification);
  router.get('/forgot-resend-otp', userController.resendForgotOtp);

  router.get('/wishlist', userController.getWishlist);
  router.get('/addToWishlist/:_id',userController.addToWishlist);
  router.get('/removeFromWishlist/:_id',userController.removeFromWishlist);
  




module.exports = router;







