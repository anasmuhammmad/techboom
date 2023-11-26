const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema');
const otpModel = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const transporter = require('../config/email');
const Category = require('../models/categorySchema');
const Banner = require('../models/bannerSchema');
const Coupon = require('../models/couponSchema');
// const { sendOTPEmail } = require('../config/email'); 
const userOtpVerification = require('../utility/otpFunctions');
const registerUser = require('../utility/registerUser');
const generateOTP = require('../utility/generateOTP');
const sendEmail = require('../utility/sendEmail');
const resendOTP = require('../utility/resendOTP');
const createCart = require('../utility/createCartForUser');
const Product = require('../models/productSchema');
const invoice = require("../utility/invoice");
const User = require('../models/userSchema');
const session = require('express-session');
const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const Brand = require('../models/brandSchema');
const razorpay = require("../utility/razorpay");
const crypto = require('crypto');
const Offer = require('../models/offerSchema');
const path = require('path');

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

const home = async (req, res) => {
  const user = await User.find();
  const products = await Product.find({status:"Active"});
  const  categories = await Category.find();
  console.log(categories); // Add this line for debugging
  res.render("user/homepage", {user,products, categories: categories ,productList, err: "" ,error: req.flash('error'), success: req.flash('success')});
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
    
    res.render('user/user-productDescription', { product, relatedProducts,user ,error: req.flash('error'), success: req.flash('success')});
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
  error: req.flash('error'), success: req.flash('success')
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
  try {
    const referrerId = req.query.referrer;
    if (referrerId) {
        req.session.referrerId = referrerId;
    }
    const errorMessages = req.flash('error');
    const successMessage = req.flash('success');
    res.render('user/user-signup', { error: errorMessages, success: successMessage ,error: req.flash('error'), success: req.flash('success')});
  } catch (error) {
    console.error('Error rendering signup page:', error);
    res.render('user/user-signup', { error: ['An unexpected error occurred.'], success: [] });
  }
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
        return res.redirect("/signup");
      }
  

      // const newUser = new User({
      //   username,
      //   email,
      //   password,
      //   // Other user-specific fields
      // });
      // const savedUser = await newUser.save();
      // createCart(savedUser._id);

    req.session.userData = {
      username, email, password
    };

    // console.log(req.session.email)



  

    res.redirect('/otp');


  } catch (error) {
    console.error('Error during signup:', error);

  req.flash('error', 'An error occurred during signup. Please try again.');
  res.redirect("/signup");
  }
};


const getUserSignupWithReferralCode = async (req, res) => {
    try {
      const _id = req.params._id;
      
    console.log("Referral Link _id:", _id);

     const user =  await User.findOneAndUpdate(
        { _id: _id },
        { $inc: { WalletAmount: 100 } },
        { new: true }
      );
      
      if (user) {
        console.log("User found and updated:", user);
        res.redirect("/signup");
    } else {
        console.log("User not found");
        res.status(404).send("User not found");
    }
     
    } catch (error) {
      console.log(error);
    }
}

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
    res.render('user/user-otpveri', { errorMessages, otp: 'Resended OTP' + otp, email , error: req.flash('error'), success: req.flash('success')}); // Pass OTP to the view
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
      req.flash('success', 'Successfully registered!');
      const newUser = await registerUser(username, email, password);

            // const newUser = new User({
      //   username,
      //   email,
      //   password,
      //   // Other user-specific fields
      // });
      // const savedUser = await newUser.save();
      createCart(newUser._id);


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
  // if(req.session.userAuth)
  // {
  // res.redirect('/homepage' );
  // }
  // else
  // {
    try {
      res.render('user/user-login',   { error: req.flash('error'), success : req.flash('success')});
      
    }

    catch(error){

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

        req.flash('success', 'Successfully logged in');

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
    const banner = await Banner.find({Status:'Enabled'});

    // Now you can use the retrieved categories in your response
    res.render('user/homepage', { banner,user: user, categories: categories , products ,   error: req.flash('error'), success: req.flash('success')});
  } 
  catch (error) {
    // Handle any errors that might occur during the database query
    console.error(error);
    res.status(500).send('An error occurred while fetching categories.');
  }
}

const getShop =async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const perPage = 16;
  const skip = (page - 1) * perPage;

  // Fetch user and other necessary data
  const userId = req.session.user.user;
  const user = await User.findById(userId);
  const categories = await Category.find();
  const brands = await Brand.find();
  const id = req.params._id;

  // Fetch products based on category, minPrice, and maxPrice
  const category = req.query.category;
  const minPrice = req.query.minPrice || 0;
  const maxPrice = req.query.maxPrice || Number.MAX_SAFE_INTEGER;

  let products;

  if (category) {
    // Fetch products based on category and price range
    products = await Product.find({
      category: category,
      price: { $gte: minPrice, $lte: maxPrice }
    }).skip(skip).limit(perPage);
  } else {
    // Fetch all products if no category is specified
    products = await Product.find().skip(skip).limit(perPage);
  }

  const totalCount = await Product.countDocuments();

  // Check the 'Accept' header to determine the response type
  const acceptHeader = req.get('Accept');

  if (acceptHeader && acceptHeader.includes('application/json')) {
    // Respond with JSON
    res.json({
      products,
      currentPage: page,
      perPage,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage)
    });
  } else {
    // Respond with HTML
    res.render('user/shop', {
      user,
      categories,
      brands,
      products,
      currentPage: page,
      perPage,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage)
    });
  }
};

  




  const getSearch =  async (req, res) => {
    const searchQuery = req.body.query;
    const productCriteria = {
      $or: [{ ProductName: { $regex: searchQuery, $options: "i" } }],
    };
    console.log("products", productCriteria);

    Category.find({ Name: { $regex: searchQuery, $options: "i" } })
      .then((categoryResults) => {
        Brand.find({ Name: { $regex: searchQuery, $options: "i" } })
          .then((brandResults) => {
            Product.find(productCriteria)
              .then((productResults) => {
                const results = {
                  products: productResults,
                  categories: categoryResults,
                  brands: brandResults,
                };
                res.json(results);
              })
              .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "An error occurred" });
              });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      });
    console.log("search Query", searchQuery);
  };


const returnOrder =   async (req, res) => {
  const orderId = req.params._id;
  try {
    console.log(req.body.returnReason)
    const order = await Order.findOneAndUpdate( { _id: orderId }, { $set:{Status: "Return Requested", ReturnReason: req.body.returnReason}}, { new: true });

    if (!order) {
      return res.status(404).send("Order not found");
    }
    return res.redirect("/orderList");
  } catch (error) {
    console.error("Error cancelling the order:", error);
    return res.status(500).send("Error requesting return");
  }
};




const downloadInvoice = async (req, res) => {
  try {
    console.log("Attempting to find order with ID:", req.body.orderId);
    const orderData = await Order.findOne({
      _id: req.body.orderId,
    })
      .populate("Address")
      .populate("Items.ProductId");
    console.log("order data ====", orderData);  


    const filePath = await invoice.order(orderData).catch((error) => {
      console.error("Error in invoice.order:", error);
      throw error; // Rethrow the error to be caught in the outer catch block
    });
    
    console.log("filePath ====", filePath);

    const orderId = orderData._id;
    console.log("orderId ====", orderId);
    res.json({ orderId });
  } catch (error) {
    console.error("Error in downloadInvoice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const downloadFile =  async (req, res) => {
  const id = req.params._id;

  if (id) {
    const filePath = `C:/Users/USER/Desktop/Desktop/Techboom/public/pdf/${id}.pdf`;
    console.log("filePath ====", filePath);
    res.download(filePath, `invoice.pdf`);
  } else {
    // Handle the case where id is not available
    res.status(404).send("File not found");
  }
};


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
       res.redirect('/homepage');
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

  const getCart = async (req, res) => {

    const userId = req.session.userId;
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ UserId: userId }).populate({
      path: 'Items.ProductId',
      model: 'Product' ,
    });
  if(cart){
    for (const item of cart.Items) {
      if (item.ProductId && item.ProductId.stock !== undefined && item.ProductId.stock <= 0) {
        item.outOfStock = true;
      } else {
        item.outOfStock = false;
      }
    }
    console.log("cart kittinnind",cart);
    res.render("user/cart", { user, cart });
  }
  else{
    const newCart = new Cart({ UserId: userId, Items: [] });
    await newCart.save();

    res.render("user/cart", { user, cart });
  }
  }

  const postCart = async(req,res)=>{
    const userId = req.session.userId
    const user = await User.findById(userId);
    if(user&&user.Status=="Blocked"){
      
      req.flash('error', 'Your account is blocked. You cannot make purchases.');
      return res.redirect('/homepage'); // Redirect to a suitable page.
    }
    else{
    req.session.totalPrice = req.body.totalPrice;
      const cart = await Cart.findOneAndUpdate(
      { UserId: userId },
      { $set: { TotalAmount: req.session.totalPrice } },
      { new: true },
    // );
    res.redirect('/checkout'));
    
  }
}
const getAddToCart =  async (req, res) => {

    const userId = req.session.userId;
    const productId = req.params._id;
    console.log(userId);
    const userCart = await Cart.findOne({ UserId: userId });
    if (userCart) {
      const existingCart = userCart.Items.find((item) =>
        item.ProductId.equals(productId)
      );
      if (existingCart) {
        existingCart.Quantity += 1;
      } else {
        userCart.Items.push({ ProductId: productId, Quantity: 1 });
      }
      await userCart.save();
    } else {
      const newCart = new Cart({
        UserId: userId,
        Items: [{ ProductId: productId, Quantity: 1 }],
      });
      console.log(newCart);
      await newCart.save();
    }
    res.redirect("/cart");
    // const userId = req.session.userId;

    // console.log('userId:', userId); // Log the userId
    // // Find the user's cart or create a new one if it doesn't exist
    // const cart = await Cart.findOne({ UserId: userId }).populate({
    //   path: 'Items.ProductId',
    //   model: 'Product', // Change 'Product' to your actual model name
    // });
    // console.log('cart:', cart); // Log the cart

    // if (!cart) {
    //   const newCart = new Cart({ UserId: userId, Items: [] });
    //   await newCart.save();
    // }

    // // Find the product to add to the cart
    // const productToAdd = await Product.findById(productId);

    // console.log('productToAdd:', productToAdd); // Log the productToAdd

    // if (!productToAdd) {
    //   return res.status(404).json({ error: "Product not found" });
    // }


    // const existingCartItem = cart.Items.find((item) =>
    //   item.ProductId.equals(productId)
    // );

    // if (existingCartItem) {
    //   // If the product is already in the cart, increase the quantity
    //   existingCartItem.Quantity += 1;
    // } else {
    //   // If the product is not in the cart, add it with a quantity of 1
    //   cart.Items.push({
    //     ProductId: productId,
    //     Quantity: 1,
    //   });
    // }

    // await cart.save();

    // res.redirect('/cart'); // Redirect to the cart page or another appropriate page
  // } catch (err) {
  //   console.log(err);
  //   // Handle the error appropriately (e.g., send an error response)
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
}
const trackOrder = async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  console.log(userId);
  const orderId = req.session.orderId
  console.log(orderId);
  const order = await Order.findById(orderId)
    .populate('Items.ProductId')
    const addressName = order?.Address?.name;
  const address = await User.findOne({ _id: userId}, {Address: { $elemMatch: { name: addressName} } })
  console.log(address,"address");
  // console.log(Address,"address");
  res.render("user/trackOrder",{user,order,address})
}

const orderList = async (req,res)=>{  
   const userId = req.session.userId;
  const user = await User.findById(userId);
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;
  const totalCount = await Order.countDocuments({ UserId: userId });
  const order = await Order.find({ UserId: userId })
    .skip(skip)
    .limit(perPage)
    .sort({ _id: -1 });
  res.render("user/orderList", {
    user,
    order,
    currentPage: page,
    perPage,
    totalCount,
    totalPages: Math.ceil(totalCount / perPage),
  });
  // const userId = req.session.userId;
  // const user = await User.findById(userId);
  // const order = await Order.find({UserId:userId})
  // res.render('user/orderList',{user,order})
}

const orderCancel = async (req,res)=>{
 

  try {
    const orderId = req.params._id;
    const order = await Order.findById(orderId);

    if (!order) {
      // Handle the case where the order with the given ID is not found
      return res.status(404).send('Order not found');
    }
    console.log('Order Status:', order.Status); // Add this line for debugging

    if (order.Status === 'Order Placed' || order.Status === 'Shipped') {
      const productsToUpdate = order.Items;
      for (const product of productsToUpdate) {
        const dbProduct = await Product.findById(product.ProductId);
        console.log(dbProduct);

        if (dbProduct) {
          dbProduct.stock += product.Quantity;
          await dbProduct.save();
        }
      }
      console.log('Cancellable Order');
      order.Status = 'Cancelled';

      await order.save();

      
      return res.redirect("/orderList");
    }
    else{
      console.log('Uncancellable Order');
    }
  } catch (error) {
    console.error('Error cancelling the order:', error);
    return res.status(500).send('Error cancelling the order');
  }
} 
const orderDetails = async(req,res)=>{

  // const userId = req.session.userId;
  // const user = await User.findById(userId);
  // const orderId=req.params._id;
  // const order=await Order.findById(orderId).populate('Items.ProductId')
  // const addressId = order.Address._id
  // const address = await User.findOne({ _id: userId}, {Address: { $elemMatch: { _id: addressId} } })
  // console.log(address,"address");
  // console.log(order,'order');
  // res.render('user/orderDetails',{user,order,address})
  const userId = req.session.userId;
  const user = await User.findById(userId);
  const orderId = req.params._id;
  const order = await Order.findById(orderId).populate('Items.ProductId');
  
  let address;  // Define a variable to store the address

  // Check if the order and address exist
  if (order && order.Address && order.Address._id) {
    // You may need to adjust this part depending on the structure of 'order.Address'
    const addressId = order.Address._id;

    address = await User.findOne(
      { _id: userId },
      { Address: { $elemMatch: { _id: addressId } } }
    );
  }

  console.log(address, "address");
  console.log(order, 'order');
  res.render('user/orderDetails', { user, order, address });
}

const getEditAddress = async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  console.log(user.Address);
  res.render('user/editAddress',{user,error: req.flash('error'), success: req.flash('success')})
}
const postEditAddress = async(req,res) => 
  {
    const addressId = req.params._id;
    const userId = req.session.userId;
    const user = await User.findById(userId);
    try {
      if (user) {
        const { Name, AddressLane, City, State, Pincode, Mobile } = req.body;
  
        // Find the index of the address in the Address array
        const addressIndex = user.Address.findIndex((a) => a._id.toString() === addressId);
  
        if (addressIndex !== -1) {
          // Update the fields of the existing address
          user.Address[addressIndex].Name = Name;
          user.Address[addressIndex].AddressLane = AddressLane;
          user.Address[addressIndex].City = City;
          user.Address[addressIndex].State = State;
          user.Address[addressIndex].Pincode = Pincode;
          user.Address[addressIndex].Mobile= Mobile;
  
          // Save the updated user document
          await user.save();
  
          console.log('Address updated successfully');
          req.flash("updated","Address updated successfully")
          res.redirect('/editAddress')
        //   res.status(200).send('Address updated successfully');
        } else {
          console.log('Address not found');
          req.flash("notFound","Address not found")
          res.redirect('/Address')
        //   res.status(404).send('Address not found');
        }
      } else {
        console.log('User not found');
        // res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error updating address:', error.message);
      res.status(500).send('Internal Server Error');
    }
  
}
const changePassword = async (req, res) => {
  const userId = req.session.userId;
  console.log("inside change password");
  const user = await User.findById(userId);
  try {
    const dbPassword = user.password;
    console.log(req.body);
    let passwordIsValid = bcrypt.compare(req.body.currentPassword, dbPassword);
    if (passwordIsValid) {
      if (req.body.newPassword === req.body.confirmPassword) {
        let passwordHashed = bcrypt.hashSync(req.body.newPassword, 8);
        const result = await User.updateOne(
          { _id: userId },
          { $set: { password: passwordHashed } },
          { new: true }
        );
        res.json({
          success: true,
          message: "Password changed successfully",
        });
      } else {
        res.json({ error: "Current Password is incorrect" });
      }
    } else {
      res.json({ error: "Please fill all fields correctly" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "Password change failed" });
  }
}

const addAddress = async (req, res) => {
  const userId = req.session.userId;
  const address = await User.findByIdAndUpdate(userId,{$push:{Address: req.body}},{new: true})
  console.log(address);
  res.redirect('/editAddress')
}
const updateQuantity =  async(req, res) => {
  try {
    const { productId, change } = req.body;
  
    const userId = req.session.userId;

    const userCart = await Cart.findOne({ UserId: userId });
    const product = await Product.findById(productId);
    if (!userCart || !product) {
      return res.status(404).json({ error: "Product or cart not found" });
    }

    const cartItem = userCart.Items.find((item) =>
      item.ProductId.equals(productId)
    );
    if (!cartItem) {
      return res.status(404).json({ error: "Product or cart not found" });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ error: "Product is currently out of stock" });
    }

    const newQuantity = cartItem.Quantity + parseInt(change);
    if (newQuantity < 1) {
      userCart.Items = userCart.Items.filter(
        (item) => !item.ProductId.equals(productId)
      );
    } 
    else if(newQuantity > product.stock) {
      return res.status(400).json({ error: "No stock up to that much" });
    }
    else {
      cartItem.Quantity = newQuantity;
    }

    await userCart.save();
    res.json({ message: "Quantity updated successfully", newQuantity });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const removeCart = async(req,res)=>{
  const userId = req.session.userId;
  const user = await User.findById(userId);
  const productId = req.params._id;

  const updatedCart = await Cart.findOneAndUpdate(
    { UserId: user },
    { $pull: { Items: { ProductId: productId } } },
    { new: true }
  );
  console.log("delete : ", updatedCart);
  res.redirect("/cart");
}
const addAddressCheckout = async (req, res) => {
  const userId = req.session.userId;
  const address = await User.findByIdAndUpdate(
    userId,
    { $push: { Address: req.body } },
    { new: true }
  );
  res.redirect("/checkout");
}
const getCheckout = async(req,res)=>{
  const userId = req.session.userId;
  const user = await User.findById(userId);
  const cart = await Cart.findOne({ UserId: userId }).populate(
    "Items.ProductId"
  );
  if (!cart) {
    res.redirect("/cart");  
  } else {
    res.render("user/checkout", { user, cart });
  }
}


const postCheckout = async(req,res)=>{
  
    console.log("inside body", req.body);
    const PaymentMethod = req.body.paymentMethod;
    const Address = req.body.Address;
    const userId = req.session.userId;
    const amount = req.session.totalPrice;
    const user = await User.findById(userId);
    const Email = user.email;
    const cart = await Cart.findOne({ UserId: userId }).populate(
      "Items.ProductId"
    );
    console.log(req.session.totalPrice);
    const address = await User.findOne(
      {
        _id: userId,
      },
      {
        Address: {
          $elemMatch: { _id: new mongoose.Types.ObjectId(Address) },
        },
      }
    );
    console.log("add====", address);

    const add = {
      Name: address.Address[0].Name,
      Address: address.Address[0].AddressLane,
      Pincode: address.Address[0].Pincode,
      City: address.Address[0].City,
      State: address.Address[0].State,
      Mobile: address.Address[0].Mobile,
    };
    const newOrders = new Order({
      UserId: userId,
      Items: cart.Items,
      OrderDate: new Date(),
      TotalPrice: req.session.totalPrice,
      Address: add,
      PaymentMethod: PaymentMethod,
    });
    const order = await newOrders.save();
    console.log("in orders==", order);
    req.session.orderId = order._id;

    for (const item of order.Items) {
      const productId = item.ProductId;
      const quantity = item.Quantity;

      const product = await Product.findById(productId);

      if (product) {
        const updatedQuantity = product.stock - quantity;

        if (updatedQuantity <= 0) {
          product.stock = 0;
          product.Status = "Out of Stock";
          await product.save();
        } else {
          product.stock = updatedQuantity;
          await product.save();
        }
      }
    }
    if (PaymentMethod === "cod") {
      const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
          user: "techboompage@gmail.com",
          pass: "",
        },
        secure: true,
      });
      const mailData = {
        from: "techboompage@gmail.com",
        to: Email,
        subject: "Your Orders!",
        text:
          `Hello! ${user.Username} Your order has been received and will be processed within one business day.` +
          ` your total price is ${req.session.totalPrice}`,
      };
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Success");
      });
      await Cart.findByIdAndDelete(cart._id);
      res.json({ codSuccess: true });

      // online checkout
    } else if(PaymentMethod === "online") {
      const order = {
        amount: amount,
        currency: "INR",
        receipt: req.session.orderId,
      };
      await razorpay
        .createRazorpayOrder(order)
        .then((createdOrder) => {
          console.log("payment response", createdOrder);
          res.json({ onlineSuccess:true, createdOrder, order });
        })
        .catch(async(err) => {
          console.log(err);
          await Cart.findByIdAndDelete(cart._id);
        });
      }else if(PaymentMethod === "wallet"){
        const transporter = nodemailer.createTransport({
          port: 465,
          host: "smtp.gmail.com",
          auth: {
            user: "techboompage@gmail.com",
            pass: process.env.Password,
          },
          secure: true,
        });
        const mailData = {
          from: "techboompage@gmail.com",
          to: Email,
          subject: "Your Orders!",
          text:
            `Hello! ${user.Username} Your order has been received and will be processed within one business day.` +
            ` your total price is ${req.session.totalPrice}`,
        };
        transporter.sendMail(mailData, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Success");
        });
        await User.findByIdAndUpdate(userId,{$inc:{WalletAmount: -order.TotalPrice}})
        await Order.findByIdAndUpdate(order._id,{PaymentStatus:'Paid'})
        await Cart.findByIdAndDelete(cart._id);
        res.json({ walletSuccess: true });
      }
  }

  // const userId = req.session.userId
  // const user = await User.findById(userId);
  // // if (user &&user.status === 'Blocked') {
   
  // //   req.flash('error', 'Your account is blocked. You cannot make purchases.');
  // //   return res.redirect('/homepage'); // Redirect to a suitable page.
  // // }
  // // else{
  // console.log(req.body);
  // const PaymentMethod = req.body.paymentMethod
  // const Address = req.body.Address
  // const amount = req.session.totalPrice;
  // const Email = user.email
  // const cart = await Cart.findOne({UserId:userId}).populate("Items.ProductId")
  // console.log(req.session.totalPrice);
  
  // const address = await User.findOne(
  //   {
  //     _id: userId,
  //   },
  //   {
  //     Address: {
  //       $elemMatch: { _id: new mongoose.Types.ObjectId(Address) },
  //     },
  //   }
  // );
  // console.log("add====", address);

//   const add = {
//     Name: address.Address[0].Name,
//     Address: address.Address[0].AddressLane,
//     Pincode: address.Address[0].Pincode,
//     City: address.Address[0].City,
//     State: address.Address[0].State,
//     Mobile: address.Address[0].Mobile,
//   };


//   const newOrders = new Order({
//    UserId: userId,
//    Items: cart.Items,
//    OrderDate: moment(new Date()).format('llll') ,
//    ExpectedDeliveryDate : moment().add(4, 'days').format('llll'),
//    TotalPrice: req.session.totalPrice,
//    Address: Address,
//    PaymentMethod: PaymentMethod
//   })
//   //delete the items in the cart after checkout  
//   await  Cart.findByIdAndDelete(cart._id)
//   //save order to database
//   const order = await  newOrders.save();
//   console.log(order,"in orders");
//   req.session.orderId = order._id

//   for (const item of order.Items) {
//    const productId = item.ProductId;
//    const quantity = item.Quantity;
 
//    const product = await Product.findById(productId);
 
//    if (product) {
//      const updatedQuantity = product.stock - quantity;
 
//      if (updatedQuantity <=0) {
//        product.stock = 0;
//    product.Status = "Out of Stock";
//    await product.save();
//      } else {
//        // Update the product's available quantity
//        product.stock = updatedQuantity;
 
//        // Save the updated product back to the database
//        await product.save();
//      }
//     }
//  }
// //  cod
//  if(PaymentMethod === "cod"){
//   //send email with details of orders
//   const transporter = nodemailer.createTransport({
//    port: 465,
//    host: "smtp.gmail.com",
//    auth: {
//      user: "techboompage@gmail.com",
//      pass: process.env.PASSWORD,
//    },
//    secure: true,
//  });
//  const mailData = {
//    from: "techboompage@gmail.com",
//    to: Email,
//    subject:'Your Orders!' ,
//    text:`Hello! ${user.username} Your order has been received and will be processed within one business day.`+
//    ` your total price is ${req.session.totalPrice}`
//  };
//  transporter.sendMail(mailData, (error, info) => {
//    if (error) {
//      return console.log(error);
//    }
//    console.log("Success");
//  });
//  res.json({ codSuccess: true });
// }

// else if(PaymentMethod === 'online') {

//   console.log("hereeeeeee");
//   const order = {
//     amount: amount,
//     currency: "INR",
//     receipt: req.session.orderId,
//   };
//   await razorpay
//     .createRazorpayOrder(order)
//     .then((createdOrder) => {
//       console.log("payment response", createdOrder);
//       res.json({ createdOrder, order });
//     })
//     .catch((err) => {
//       console.log(err);
//     });

  
    
  
// }
// else if(PaymentMethod === "wallet"){
//   const transporter = nodemailer.createTransport({
//     port: 465,
//     host: "smtp.gmail.com",
//     auth: {
//       user: "techboompage@gmail.com",
//       pass: process.env.PASSWORD,
//     },
//     secure: true,
//   });
//   const mailData = {
//     from: "techboompage@gmail.com",
//     to: Email,
//     subject: "Your Orders!",
//     text:
//       `Hello! ${user.Username} Your order has been received and will be processed within one business day.` +
//       ` your total price is ${req.session.totalPrice}`,
//   };
//   transporter.sendMail(mailData, (error, info) => {
//     if (error) {
//       return console.log(error);
//     }
//     console.log("Success");
//   });
//   await User.findByIdAndUpdate(userId,{$inc:{WalletAmount: -order.TotalPrice}})
// await Order.findByIdAndUpdate(order._id,{PaymentStatus:'Paid'})
// await Cart.findByIdAndDelete(cart._id);
// res.json({ walletSuccess: true });
// }
//  res.redirect('/orderSuccess')
//   console.log(cart.Items);



const verifyPayment= async (req, res) => {
  const PaymentMethod = req.body.paymentMethod;
    const Address = req.body.Address;
    const userId = req.session.userId;
    const amount = req.session.totalPrice;
    const user = await User.findById(userId);
    const Email = user.email;
    const cart = await Cart.findOne({ UserId: userId }).populate(
      "Items.ProductId"
    );
  console.log("it is the body", req.body);
  let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
  hmac.update(
    req.body.payment.razorpay_order_id +
      "|" +
      req.body.payment.razorpay_payment_id
  );

  hmac = hmac.digest("hex");
  if (hmac === req.body.payment.razorpay_signature) {
    const orderId = new mongoose.Types.ObjectId(
      req.body.order.createdOrder.receipt
    );
    const updateOrderDocument = await Order.findByIdAndUpdate(orderId, {
      PaymentStatus: "Paid",
      PaymentMethod: "Online",
    });

    await Cart.findByIdAndDelete(cart._id);

    console.log('Order and cart updated and deleted successfully');

    res.json({ success: true });
  } else {
    console.log("hmac failed");
    res.json({ failure: true });
  }
};





const checkCoupon = async(req,res)=>{
  try {
    console.log("inside try");
    const userId = req.session.userId;
    let code = req.body.code;
    let totalString = req.body.total; // Assuming totalString is a string
    let numericPart = totalString.replace(/[^0-9.]/g, ''); // Removes non-numeric characters
    let total = parseFloat(numericPart);
    // console.log("code issssss",code);
    // console.log("total is sss",total);
    let discount = 0;
    const couponMatch = await Coupon.findOne({ couponCode: code });
    if (couponMatch) {
      if (couponMatch.status === true) {
        let currentDate = new Date();
        let startDate = couponMatch.startDate;
        let endDate = couponMatch.endDate;
        if (startDate <= currentDate && currentDate <= endDate) {
          if (couponMatch.applyType === "categories") {
          } else {
            let couponLimit = await Coupon.findOne({
              couponCode: couponMatch.couponCode,
              "usedBy.userId": userId,
            });
            console.log("here is coupon limit", couponLimit);
            if(!couponLimit){
              result = await Coupon.updateOne(
                  { couponCode: couponMatch.couponCode },
                  { $push: { usedBy: { userId, limit: 1 } } }
                );
            }
            couponLimit = await Coupon.findOne({
              couponCode: couponMatch.couponCode,
              "usedBy.userId": userId,
            });
            const usedByEntry = couponLimit.usedBy.find(entry =>  {
              if (entry.userId && userId) {
                return entry.userId.toString() === userId.toString();

              }
              return false;
            });
            let limit
            if (usedByEntry) {
              limit = usedByEntry.limit;
            }
            console.log("after update", limit);
            console.log("after", couponMatch.limit);

            if (limit === couponMatch.limit) {
              return res.json({ error: "Coupon limit exceeded" });
            } else {
              if (couponMatch.couponType === "public") {
                let result;
                let usedCoupon = await Coupon.findOne({
                  couponCode: couponMatch.couponCode,
                  "usedBy.userId": userId,
                });
                if (!usedCoupon) {
                  result = await Coupon.updateOne(
                    { couponCode: couponMatch.couponCode },
                    { $push: { usedBy: { userId, limit: 1 } } }
                  );
                } else if (usedCoupon) {
                  result = await Coupon.updateOne(
                    {
                      couponCode: couponMatch.couponCode,
                      "usedBy.userId": userId,
                    },
                    { $inc: { "usedBy.$.limit": 1 } }
                  );
                } else {
                  return res.json({ error: "You can use only one time" });
                }
                if (couponMatch.discountType === "fixed") {
                  console.log("insidee fixedddd");
                  console.log("total", total);
                  if (total >= couponMatch.minAmountFixed) {
                    discount = couponMatch.amount;
                    res.json({ success: true, discount });
                  } else {
                    return res.json({
                      error: `Cart should contain a minimum amount of ${couponMatch.minAmountFixed}`,
                    });
                  }
                } else {
                  if (total >= couponMatch.minAmount) {
                    // discount = total * (couponMatch.minAmount / 10000);
                    const discountDecimal = couponMatch.minAmount / 10000;
                    discount = Math.ceil(total * discountDecimal);
                    res.json({ success: true, discount });
                  } else {
                    return res.json({
                      error: `Cart should contain a minimum amount of ${couponMatch.minAmount}`,
                    });
                  }
                }
              } else {
                //private coupon
              }
            }
          }
        } else {
          return res.json({ error: "COUPON expired" });
        }
      } else {
        return res.json({ error: "COUPON expired" });
      }
    } else {
      return res.json({ error: "COUPON doesn't exist" });
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "Some error Occurred" });
  }
}
const orderSuccess = async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  res.render('user/orderSuccess',{user});
}
const products = async (req, res) => {

  try {
    const productId = req.params.productId;
    const user=req.session.userId
    // Fetch product details from the database based on the productId
    const product = await Product.findById(productId);
    const relatedProducts =await Product.find();

    console.log("userIdprod", user);
    if (!product) {
      // Handle the case when the product is not found (e.g., show an error page)
      return res.status(404).render('error', { message: 'Product not found' });
    }
    
    // if ( product.stock===0) {
    //   return res.status(400).json({ error: 'Out of stock' });
    // }
  
    // Render the product details page with the product data
    res.render('user/user-productDescription', { product,relatedProducts,user });
  } catch (error) {
    // Handle any errors that might occur during the database query
    console.error(error);
    res.status(500).render('error', { message: 'An error occurred while fetching product details' });
  }
}
const logout = (req, res) => {
try {
  res.redirect('/login');
}
catch (error) {

}
};
module.exports = {
  home,productdetails, renderOtpPage,getProfile, renderSignupPage, returnOrder,postSignup, postOtpVerification, resendOtp, renderLoginPage,
  postUserLogin, renderHomePage,renderForgotPasswordPage, postForgotPassword,getUserSignupWithReferralCode, renderForgotOtpPage,postForgotOtpVerification,resendForgotOtp,
  getCart,postCart,getAddToCart,addAddressCheckout,trackOrder,orderList,orderCancel,orderDetails, getEditAddress, postEditAddress , changePassword,addAddress
  ,updateQuantity,getSearch,removeCart, downloadFile,downloadInvoice,getCheckout,verifyPayment, postCheckout,checkCoupon,orderSuccess,products,getShop,logout
};






