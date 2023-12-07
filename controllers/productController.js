const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const cropImage = require("../utility/imageCrop")
const Order = require("../models/orderSchema");
const upload = require('../middlewares/upload')

const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require('../middlewares/adminAuth');
const Cart = require("../models/cartSchema");
const  trimProperties  = require('../utility/trim');

require('dotenv').config();
module.exports ={
getProduct: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; 
      const perPage = 10; 
      const skip = (page - 1) * perPage;

      const products = await Product.find().skip(skip).limit(perPage).lean();

      const totalCount = await Product.countDocuments();

      res.render("admin/adminShowProducts", {
        products,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  blockProduct: async (req, res) => {
    try {
      const _id = req.params._id;

      const product = await Product.findOne({ _id: _id });
      console.log(product);
      if (product.status === "Active") {
        const updatedProduct = await Product.findByIdAndUpdate(_id, { status: "Inactive" });
        const alertMessage = "This product is being inactive";
        req.session.alert = alertMessage;
        console.log('blocked');
        res.redirect("/admin/product");
      } else if (product.status === "Inactive") {
        const updatedProduct = await Product.findByIdAndUpdate(_id, { status: "Active" });
        const alertMessage = "This product is being active";
        req.session.alert = alertMessage;
        console.log('unblocked');
        res.redirect("/admin/product");
      }
    } catch (error) {
      const alertMessage = "This is an alert message.";
      req.session.alert = alertMessage;
      res.redirect("/admin/product");
    }

  },

      getAddProduct: async (req, res) => {
    const categories = await Category.find()
    const brand = await Brand.find()
    res.render("admin/addProduct", { categories, brand });
  },


  postAddProduct: async (req, res) => {
    try {
    
      console.log(req.files);
      
      const {
        ProductName,
        Description,
        Specification1,
        Specification2,
        Specification3,
        Specification4,
        image,
        Price,
        DiscountAmount,
        
        storagesize, 
        graphicscard, 
        AvailableQuantity,
        Category,
        BrandName,
        Tags,
      } = trimProperties(req.body);
      
      console.log('Destructured ProductName:', ProductName);
    
      const imageFileNames = req.files.map((file) => file.filename);
  
      const productType = req.body.productType;
   
      const variations = [] ;
      
      if (productType === 'Storage Devices') {
        const storagesize = req.body.storagesize;
        variations.push({ name: 'Storage Size', value: storagesize });
      } else if (productType === 'Graphics Card') {
        const graphicscard = req.body.graphicscard;
        variations.push({ name: 'GPU Model', value: graphicscard });
      }
   
      
      const newProduct = new Product({
        name: ProductName,
        description: Description,
        specifications: [Specification1, Specification2, Specification3, Specification4],
        images: imageFileNames,
        price: Price,
        discountPrice: DiscountAmount,
        type: productType,
        stock: AvailableQuantity,
        category: Category,
        brand: BrandName,
        tags: Tags.split(',').map((tag) => tag.trim()),
        variation:variations, 
      });
  
     
      await newProduct.save();
  
      
      res.redirect('/admin/product');
    } catch (error) {
     
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },
  


  getEditProduct: async (req, res) => {
    try{
  
    const _id = req.params._id;
    const product = await Product.findById(_id);
    const categories = await Category.find();
    const brand = await Brand.find();
    console.log(product);
    if (!product) {
     
      return res.render('admin/error', { message: 'Product not found' });
    }
    res.render("admin/editProduct", { product,categories,brand});
  }catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
},

    postEditProduct: async (req, res) => {
       
      try {
        const _id  = req.params._id;
        const image = [];
        
        console.log(req.body);
     
        
      
        const productType = req.body.productType;
        const category = await Category.findOne({ Name: req.body.Category });
        const BrandName = await Brand.findOne({ Name: req.body.BrandName });
     
        const variations = [];
    

        if (productType === 'Storage Devices') {
          const storagesizeValue = req.body.storagesize;
          variations.push({ name: 'Storage Size', value: storagesizeValue });
        } else if (productType === 'Graphics Card') {
          const graphicscardValue = req.body.graphicscard;
          variations.push({ name: 'GPU Model', value: graphicscardValue });
        }
        for (let i = 1; i <= 3; i++) {
          const fieldName = `image${i}`;
          if (req.files[fieldName] && req.files[fieldName][0]) {
            image.push(req.files[fieldName][0].filename);
          }
        }
       
       

        const fieldName = 'image';

        if (req.files[fieldName] && req.files[fieldName][0]) {
          image.push(req.files[fieldName][0].filename);
        }
        console.log('Image Paths:', image);

    
        const updatedProduct = {
          name: req.body.ProductName,
          description: req.body.Description,
          Specification1: req.body.Specification1, 
          
          Specification2:req.body.Specification2, 
          Specification3:req.body.Specification3, 
          Specification4:req.body.Specification4,
          images: image,
          price: req.body.Price,
          discountPrice: req.body.DiscountAmount,
          type: req.body.productType,
          stock: req.bodyAvailableQuantity,
          category: category._id,
          brand: req.body.BrandName,
          tags: req.body.Tags,
          variation:req.body.variations,
         
        };
    
      
        const result = await Product.findByIdAndUpdate(_id, updatedProduct, { new: true });
    
        if (result) {
  
          res.redirect(`/admin/product`);
        } else {
          res.status(404).send('Product not found');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    

    },



}