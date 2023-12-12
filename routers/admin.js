const express = require('express');
const router = express.Router();
const userOtpVerification = require('../utility/otpFunctions');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const offerController = require('../controllers/offerController');
// const orderController = require('../controllers/orderController');
const Admin = require('../models/adminSchema');
const Category = require('../models/categorySchema');
const Brand = require('../models/brandSchema');
const Product = require("../models/productSchema");

const flash = require("express-flash");
const bcrypt = require("bcrypt");
const auth  = require("../middlewares/adminAuth");
const { route } = require('./user');
const couponController = require('../controllers/couponController');
const mongoose = require('mongoose');
const upload = require('../middlewares/upload')
const bannerController = require('../controllers/bannerController');




// admin - Login
router.get('/admin/login', adminController.getLogin);
router.post('/admin/login', adminController.postLogin);
router.get('/admin/logout', adminController.logout);


router.get('/admin/dashboard', auth.authMiddleware, adminController.getDashboard);
router.get('/admin/latestOrders', auth.authMiddleware, adminController.getOrdersAndSellers);
router.get('/admin/count-orders-by-year',auth.authMiddleware, adminController.getCount)
router.get('/admin/count-orders-by-month',auth.authMiddleware,adminController.getCount);
router.get('/admin/count-orders-by-day',auth.authMiddleware,adminController.getCount);

router.post('/admin/download-sales-report',auth.authMiddleware,adminController.getDownloadSalesReport);

router.get("/admin/product",auth.authMiddleware, productController.getProduct)
router.get("/admin/product/:_id",auth.authMiddleware,productController.blockProduct)

router.get('/admin/editproduct/:_id',auth.authMiddleware, productController.getEditProduct)
router.post('/admin/editproduct/:_id',auth.authMiddleware,upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postEditProduct)


router.get('/admin/userslist',auth.authMiddleware,adminController.getUser)
router.get('/admin/userlist/:_id',auth.authMiddleware,adminController.blockUser)


router.get('/admin/categoriesandbrands',auth.authMiddleware,adminController.getCategoriesAndBrands)
router.get('/admin/addcategory',auth.authMiddleware,adminController.getAddCategory)
router.post('/admin/addcategory',auth.authMiddleware,upload.single('image'),adminController.postAddCategory)
router.get('/admin/edit/:id',auth.authMiddleware,adminController.getEditCategory)
router.post('/admin/edit/:id',auth.authMiddleware,upload.single('image'),adminController.postEditCategory)
router.get('/admin/addbrand',auth.authMiddleware,adminController.getAddBrand)
router.post('/admin/addbrand',auth.authMiddleware,adminController.postAddBrand)



router.get('/admin/coupons',auth.authMiddleware,couponController.getCoupon)
router.get('/admin/addCoupon',auth.authMiddleware,couponController.getAddCoupon)
router.post('/admin/addCoupon',auth.authMiddleware,couponController.postAddCoupon)

router.get('/admin/offers',auth.authMiddleware,offerController.getOffers)
router.post('/admin/addCategoryOffer',auth.authMiddleware,offerController.addCategoryOffer)
router.post('/admin/offers/disableAndEnableOffer/:_id',auth.authMiddleware,offerController.offerStatus);

router.get('/admin/offers',auth.authMiddleware,offerController.getOffers)


router.get('/admin/addproduct',auth.authMiddleware,adminController.getAddProduct)
router.post('/admin/addproduct',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),adminController.postAddProduct)


router.get('/admin/order',auth.authMiddleware,adminController.getOrders)
router.get('/admin/order/details/:_id',auth.authMiddleware,adminController.getOrderDetails)
router.put('/admin/order/update-status/:orderId',adminController.putUpdateStatus)
router.get('/admin/orders/return-request',adminController.getReturnRequests); 
router.post('/admin/order/handleRequest',adminController.getHandleRequest);    

router.get('/admin/banners',auth.authMiddleware,bannerController.getBanners);
router.get('/admin/addBanner',auth.authMiddleware,bannerController.getAddBanners);
router.post('/admin/addBanner',auth.authMiddleware,upload.fields([{ name: 'Image', maxCount: 1 },

]),bannerController.postAddBanner);

router.post('/admin/activate-banner/:id',auth.authMiddleware,bannerController.activateBanner);

router.post('/admin/delete-banner/:id',auth.authMiddleware,bannerController.deleteBanner);

module.exports = router;    