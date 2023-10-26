const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')

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

const Order = require('../models/orderSchema');
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




// router.get('/', userController.renderHomePage);
// router.get('/shop',userController.renderShopPage);
// router.get('/productdetails/:productId',userController.productdetails)




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


  router.get('/product/:productId', async (req, res) => {

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
  });

  router.get('/cart',async (req, res) => {

    const userId = req.session.userId;
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ UserId: userId }).populate({
      path: 'Items.ProductId',
      model: 'Product' ,
    });
  if(cart){
    for (const item of cart.Items) {
      if (item.ProductId.stock <= 0) {
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
  })

router.post('/cart',async(req,res)=>{
  req.session.totalPrice = req.body.totalPrice;
  res.redirect('/checkout')
})

router.get('/addtocart/:_id', async (req, res) => {
  try {
    const productId = req.params._id;
    const userId = req.session.userId;

    console.log('userId:', userId); // Log the userId
    // Find the user's cart or create a new one if it doesn't exist
    const cart = await Cart.findOne({ UserId: userId }).populate({
      path: 'Items.ProductId',
      model: 'Product', // Change 'Product' to your actual model name
    });
    console.log('cart:', cart); // Log the cart

    if (!cart) {
      const newCart = new Cart({ UserId: userId, Items: [] });
      await newCart.save();
    }

    // Find the product to add to the cart
    const productToAdd = await Product.findById(productId);

    console.log('productToAdd:', productToAdd); // Log the productToAdd

    if (!productToAdd) {
      return res.status(404).json({ error: "Product not found" });
    }


    const existingCartItem = cart.Items.find((item) =>
      item.ProductId.equals(productId)
    );

    if (existingCartItem) {
      // If the product is already in the cart, increase the quantity
      existingCartItem.Quantity += 1;
    } else {
      // If the product is not in the cart, add it with a quantity of 1
      cart.Items.push({
        ProductId: productId,
        Quantity: 1,
      });
    }

    await cart.save();

    res.redirect('/cart'); // Redirect to the cart page or another appropriate page
  } catch (err) {
    console.log(err);
    // Handle the error appropriately (e.g., send an error response)
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get('/trackOrder', async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  console.log(userId);
  const orderId = req.session.orderId
  console.log(orderId);
  const order = await Order.findById(orderId)
    .populate('Items.ProductId')
  const addressId = order.Address._id
  const address = await User.findOne({ _id: userId}, {Address: { $elemMatch: { _id: addressId} } })
  console.log(address,"address");
  // console.log(Address,"address");
  res.render("user/trackOrder",{user,order,address})
})

router.get('/orderList', async (req,res)=>{
  const userId = req.session.userId;
  const user = await User.findById(userId);
  const order = await Order.find({UserId:userId})
  res.render('user/orderList',{user,order})
},)

router.get('/order/cancel/:_id',async (req,res)=>{
 

  try {
    const orderId = req.params._id;
    const order = await Order.findById(orderId);

    if (!order) {
      // Handle the case where the order with the given ID is not found
      return res.status(404).send('Order not found');
    }
    console.log('Order Status:', order.Status); // Add this line for debugging

    if (order.Status === 'Order Placed' || order.Status === 'Shipped') {
      console.log('Cancellable Order');
      order.Status = 'Cancelled';

      await order.save();

      return res.status(200).send('Order has been successfully canceled');
    }
    else{
      console.log('Uncancellable Order');
    }
  } catch (error) {
    console.error('Error cancelling the order:', error);
    return res.status(500).send('Error cancelling the order');
  }
} )
    // } else {
    //   console.log('Cannot Cancel Order. Status:', order.Status); // Add this line for debugging
    //   return res.status(400).send('Order cannot be cancelled');
    // }
router.get('/order/details/:_id',async(req,res)=>{

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
} )

router.get('/editAddress',async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  console.log(user.Address);
  res.render('user/editAddress',{user})
});
router.post('/editAddress/:_id',async (req,res)=> {
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
})
router.post('/changePassword', async (req, res) => {
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
})


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

router.post('/addAddress',async (req, res) => {
  const userId = req.session.userId;
  const address = await User.findByIdAndUpdate(userId,{$push:{Address: req.body}},{new: true})
  console.log(address);
  res.redirect('/editAddress')
})


router.post('/updateQuantity', async(req, res) => {
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
})

router.get('/removefromcart/:_id',async(req,res)=>{
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
})

router.get('/checkout',async(req,res)=>{
  const userId = req.session.userId;
  const user = await User.findById(userId);
  res.render('user/checkout',{user});
})
router.post('/checkout',async(req,res)=>{
  console.log(req.body);
  const PaymentMethod = req.body.paymentMethod
  const Address = req.body.Address
  const userId = req.session.userId
  const user = await User.findById(userId);
  const Email = user.email
  const cart = await Cart.findOne({UserId:userId}).populate("Items.ProductId")
  console.log(req.session.totalPrice);


  const newOrders = new Order({
   UserId: userId,
   Items: cart.Items,
   OrderDate: moment(new Date()).format('llll') ,
   ExpectedDeliveryDate : moment().add(4, 'days').format('llll'),
   TotalPrice: req.session.totalPrice,
   Address: Address,
   PaymentMethod: PaymentMethod
  })
  //delete the items in the cart after checkout  
  await  Cart.findByIdAndDelete(cart._id)
  //save order to database
  const order = await  newOrders.save();
  console.log(order,"in orders");
  req.session.orderId = order._id

  for (const item of order.Items) {
   const productId = item.ProductId;
   const quantity = item.Quantity;
 
   const product = await Product.findById(productId);
 
   if (product) {
     const updatedQuantity = product.stock - quantity;
 
     if (updatedQuantity < 0) {
       product.stock = 0;
   product.Status = "Out of Stock";
     } else {
       // Update the product's available quantity
       product.stock = updatedQuantity;
 
       // Save the updated product back to the database
       await product.save();
     }
   }
 }

  //send email with details of orders
  const transporter = nodemailer.createTransport({
   port: 465,
   host: "smtp.gmail.com",
   auth: {
     user: "techboompage@gmail.com",
     pass: process.env.PASSWORD,
   },
   secure: true,
 });
 const mailData = {
   from: "techboompage@gmail.com",
   to: Email,
   subject:'Your Orders!' ,
   text:`Hello! ${user.username} Your order has been received and will be processed within one business day.`+
   ` your total price is ${req.session.totalPrice}`
 };
 transporter.sendMail(mailData, (error, info) => {
   if (error) {
     return console.log(error);
   }
   console.log("Success");
 });
 res.redirect('/orderSuccess')
  console.log(cart.Items);

})

router.get('/orderSuccess', async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  res.render('user/orderSuccess',{user});
});

  

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







