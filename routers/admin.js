const express = require('express');
const router = express.Router();
const userOtpVerification = require('../utility/otpFunctions');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const adminAuth = require('../middlewares/adminAuth');
const Admin = require('../models/adminSchema');
const Category = require('../models/categorySchema');
const Brand = require('../models/brandSchema');
const Product = require("../models/productSchema");
const jwt = require("jsonwebtoken");
const flash = require("express-flash");
const bcrypt = require("bcrypt");
const { route } = require('./user')




// const adminData = {
//     Email: 'anasmuhammed444@gmail.com',
//     Password: '123',
//     Status: 'Active',
//   };
//   bcrypt.hash(adminData.Password, 10, async (err, hashedPassword) => {
//         const newAdmin = new Admin({
//           Email: adminData.Email,
//           Password: hashedPassword,
//           Status: adminData.Status,
//         });
//         await newAdmin.save();
//         console.log('Admin account created successfully.');
//     }
//   )

const newProduct = new Product({
    name: 'AMD 5000 Series Ryzen 7 5700X Desktop Processor 8 cores 16 Threads 36 MB Cache 3.4 GHz Upto 4.6 GHz Socket AM4 500 Series Chipset (100-100000926WOF) ',
    specifications: 'CPU Manufacturer: AMD, CPU Model: Ryzen 7, CPU Speed: 3.4',
    type: ['Electronics','Computer Hardware', 'Processors'],
    images: [],
    stock: 5,
    rating: '4 stars',
    review: 'Worthy product!',
    // Add values for other fields as needed    
  });
  
  const imagePath = '/uploads/61eXyK93hQL._SL1500_.jpg'
  newProduct.images.push(imagePath);
  // Save the product to the database
  newProduct.save()
    .then(savedProduct => {
      console.log('Product saved:', savedProduct);
    })
    .catch(error => {
      console.error('Error saving product:', error);
    });

// admin - Login
router.get('/admin/login', adminController.getLogin);
router.post('/admin/login', adminController.postLogin);


// router.post('/admin/login', async (req, res) => {

//     try {
//         const Email = req.body.Email;
//         console.log(req.body.Email);
//         const Password = req.body.Password;
//         const admin = await Admin.findOne({ Email: Email });
//         console.log(admin);
//         if (admin.Status === "Active") {
//             const matchedPassword = await bcrypt.compare(Password, admin.Password);
//             if (matchedPassword) {
//                 const accessToken = jwt.sign(
//                     { admin: admin._id },
//                     process.env.ACCESS_TOKEN_SECRET,
//                     { expiresIn: 60 * 60 }
//                 );
//                 res.cookie("adminJwt", accessToken, { maxAge: 60 * 1000 * 60 });
//                 req.session.admin = admin;
//                 res.redirect("/addproduct");
//             } else {
//                 console.log(error);
//                 res.redirect("/admin/login");
//             }
//         } else {
//             console.log(error);
//             res.redirect("/admin/login")
//         }
//     }

//     catch (error) {
//         console.log(error);
//         res.redirect("/admin/login");
//     }
// })
// product-page
router.get("/admin/product", adminController.getProduct)

router.get('/admin/editproduct/:_id', adminController.getEditProduct)
router.post('/admin/editproduct/:_id', adminController.postEditProduct)


router.get('/admin/userslist',adminController.getUser)
router.get('/admin/userlist/:_id',adminController.blockUser)


router.get('/admin/categoriesandbrands',adminController.getCategoriesAndBrands)

router.get('/admin/addcategory',adminController.getAddCategory)
router.post('/admin/addcategory',adminController.postAddCategory)
router.get('/editproduct', async (req,res)=>{
    const product =  await Product.find();
    res.render('admin/editProduct', {product});
  })
router.get('/admin/addproduct',adminController.getAddProduct)



module.exports = router;