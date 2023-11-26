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
router.get('/productdetails/:productId',userController.productdetails)

router.get('/shop',userController.getShop)
router.post('/search-product', userController.getSearch)
router.get('/category/:_id',userController.getShop)
router.get('/brand/:_id',userController.getShop)

router.get('/signup', userController.renderSignupPage);
router.post('/signup', userController.postSignup);

router.get('/signup/:_id', userController.getUserSignupWithReferralCode)





router.get('/otp', userController.renderOtpPage);
router.post('/otp', userController.postOtpVerification)
router.get('/resend-otp', userController.resendOtp)



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
router.post('/order/return/:_id',userController.returnOrder)

router.post('/download-invoice',userController.downloadInvoice)
router.get('/download-invoice/:_id',userController.downloadfile)

router.get('/editAddress',userController.getEditAddress);
router.post('/editAddress/:_id',userController.postEditAddress)
router.post('/changePassword', userController.changePassword)



router.post('/addAddress',userController.addAddress)


router.post('/updateQuantity',userController.updateQuantity)

router.get('/removefromcart/:_id',userController.removeCart)



router.get('/checkout',userController.getCheckout)

router.post('/checkout',userController.postCheckout)

router.post('/verify-payment',userController.verifyPayment)
router.post('/addAddress-Checkout',userController.addAddressCheckout)


router.post('/checkCoupon',couponController.checkCoupon)

router.get('/coupons',couponController.getCoupons)

router.get('/orderSuccess', userController.orderSuccess);

  

  router.get('/forgotPassword', userController.renderForgotPasswordPage);
  router.post('/forgotPassword',userController.postForgotPassword);

  router.get('/forgot-otp', userController.renderForgotOtpPage);
  router.post('/forgot-otp', userController.postForgotOtpVerification);
  router.get('/forgot-resend-otp', userController.resendForgotOtp);



  


router.get('/logout',userController.logout);

module.exports = router;







