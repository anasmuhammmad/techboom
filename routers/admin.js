const express = require('express');
const router = express.Router();
const userOtpVerification = require('../utility/otpFunctions');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const auth = require('../middlewares/adminAuth');
const Admin = require('../models/adminSchema');
const Category = require('../models/categorySchema');
const Brand = require('../models/brandSchema');
const Product = require("../models/productSchema");
const jwt = require("jsonwebtoken");
const flash = require("express-flash");
const bcrypt = require("bcrypt");
const { route } = require('./user');
const mongoose = require('mongoose');
const upload = require('../middlewares/upload')


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
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); // Specify the directory to store uploaded images
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname); // Define the file name
//     },
//   });
//   const uploadd = multer({ storage: storage });
// const newProduct = new Product({
//     name: 'Deepcool AG400 LED Single Tower 120 mm CPU Air Cooler/CPU Fan',
//     specifications: 'Item Dimensions LxWxH: 12.5 x 9.2 x 15 Centimeters, Power Connector Type: 4-Pin, Voltage: 12 Volts',
//     type: ['Electronics', 'Computer Hardware', 'CPU Fan'],
//     images: '', // You should provide image data here if it's required.
//     stock: 21,
//     rating: '4 stars',
//     price: 2500,
//     discountPrice: 2000,
//     status: 'Inactive',
//     display: 'Some Value', // Provide a value for the 'display' field.
//     category: 'CPU Coolers', // Provide a value for the 'category' field.
//     updatedDate: new Date('2023-01-10'), // Ensure 'updatedDate' is a Date object.
//     review: 'Efficient product!',
//   });
//   if (newProduct.updatedDate) {
//     // Format the 'updatedDate' for display
//     const formattedUpdatedDate = newProduct.updatedDate.toLocaleDateString();

//     // Now 'formattedUpdatedDate' contains a human-readable date string, e.g., "10/01/2023".
// } else {
//     console.error('The updatedDate property is undefined in the newProduct object.');
// }
// //   const imagePath = '/uploads/61vTO5fpEpL._SL1500_.jpg'
// //   newProduct.images.push(imagePath);
// //   // Save the product to the database
//   newProduct.save()
//     .then(savedProduct => {
//       console.log('Product saved:', savedProduct);
//     })
//     .catch(error => {
//       console.error('Error saving product:', error);
//     });

// const brandNamesToAdd = [
//   'Intel',
//   'Ryzen',
//   'Adata',
//   // Add more brand names as needed
// ];
// async function insertBrands() {
//   try {
//       for (const brandName of brandNamesToAdd) {
//           const brand = new Brand({ Name: brandName });
//           await brand.save();
//           console.log(`Added brand: ${brandName}`);
//       }
//       console.log('Brands added successfully.');
//   } catch (error) {
//       console.error('Error adding brands:', error);
//   } finally {
//       mongoose.connection.close();
//   }
// }
// const newCategory = new Category({
//   Name: 'SSD', // Replace with the category name you want to add





// admin - Login
router.get('/admin/login', adminController.getLogin);
router.post('/admin/login', adminController.postLogin);
router.get('/admin/logout', adminController.logout);

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
router.get("/admin/product",auth.authMiddleware, adminController.getProduct)
router.get("/admin/product/:_id",auth.authMiddleware,adminController.blockProduct)

router.get('/admin/editproduct/:_id',auth.authMiddleware, adminController.getEditProduct)
    router.post('/admin/editproduct/:_id',auth.authMiddleware,upload.array('image',3),adminController.postEditProduct)


router.get('/admin/userslist',auth.authMiddleware,adminController.getUser)
router.get('/admin/userlist/:_id',auth.authMiddleware,adminController.blockUser)


router.get('/admin/categoriesandbrands',auth.authMiddleware,adminController.getCategoriesAndBrands)
router.get('/admin/addcategory',auth.authMiddleware,adminController.getAddCategory)
router.post('/admin/addcategory',auth.authMiddleware,upload.single('image'),adminController.postAddCategory)
router.get('/admin/edit/:id',auth.authMiddleware,adminController.getEditCategory)
router.post('/admin/edit/:id',upload.single('image'),adminController.postEditCategory)
router.get('/admin/addbrand',adminController.getAddBrand)
router.post('/admin/addbrand',adminController.postAddBrand)





router.get('/admin/addproduct',adminController.getAddProduct)
router.post('/admin/addproduct',upload.array('image',3),adminController.postAddProduct)


router.get('/admin/order',adminController.getOrders)
router.get('/admin/order/details/:_id',adminController.getOrderDetails)
router.put('/admin/order/update-status/:orderId',adminController.putUpdateStatus)

module.exports = router;