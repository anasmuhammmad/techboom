const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const cropImage = require("../utility/imageCrop")
const Order = require("../models/orderSchema");
const upload = require('../middlewares/upload')
// const cropImage = require("../utility/imageCrop")
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require('../middlewares/adminAuth');
const Cart = require("../models/cartSchema");
const  trimProperties  = require('../utility/trim');
// const cron = require('node-cron')
require('dotenv').config();
module.exports ={
getProduct: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
      const perPage = 10; // Number of items per page
      const skip = (page - 1) * perPage;

      // Query the database for products, skip and limit based on the pagination
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
      const image = [];
      const productType = req.body.ProductType;
      const variations = [];
      const category = await Category.findOne({ Name: req.body.Category });
      const BrandName = await Brand.findOne({ Name: req.body.BrandName });
      if (productType === "Storage Devices") {
        const storagesize = req.body.storagesize;
        //     variations.push({ name: 'Storage Size', value: storagesize });
        variations.push({ value: watchColors });
        variations.push({ name: 'Storage Size', value: storagesize });
      } else if (productType === "Graphics Card") {
        const graphicscard = req.body.graphicscard;
        variations.push({ value: graphicscard });
      }
      console.log(variations[0]);

      // for (let i = 1; i <= 3; i++) {
      //   const fieldName = `image${i}`;
      //   if (req.files[fieldName] && req.files[fieldName][0]) {
      //     image.push(req.files[fieldName][0].filename);
      //   }
      // }
      let Status;
      cropImage(image)
      if (req.body.stock <= 0) {
        Status = "Inactive";
      } else {
        Status = "Active";
      }
      const imageFileNames = req.files.map((file) => file.filename);
      const newProduct = new Product({
        name: req.body.ProductName,
        price: req.body.Price,
        description: req.body.Description,
        specifications: [req.body.Specification1,req.body.Specification2, req.body.Specification3, req.body.Specification4],
        images: imageFileNames,
        brand: BrandName,
        tags: req.body.Tags,
        stock: req.body.AvailableQuantity,
        category: category._id,
        status: Status,
        // status: "Active",
       
        discountPrice: req.body.DiscountAmount,
        Variation: variations.length > 0 ? variations[0].value : null, // Check if variations[0] exists,
        ProductType: req.body.ProductType,
        UpdatedOn: new Date(),
        
      });
      newProduct.save();
      res.redirect("/admin/product");
    } catch (error) {
      console.log(`An error happened ${error}`);
    }
  },
    // try {
    
    //   console.log(req.files);
      
    //   const {
    //     ProductName,
    //     Description,
    //     Specification1,
    //     Specification2,
    //     Specification3,
    //     Specification4,
    //     image,
    //     Price,
    //     DiscountAmount,
        
    //     storagesize, 
    //     graphicscard, 
    //     AvailableQuantity,
    //     Category,
    //     BrandName,
    //     Tags,
    //   } = trimProperties(req.body);
      
    //   console.log('Destructured ProductName:', ProductName);
    //   // Extract image file names from req.files
    //   const imageFileNames = req.files.map((file) => file.filename);
  
    //   const productType = req.body.productType;
    //   // Create an object to hold variations based on the product type
    //   const variations = [] ;
      
    //   if (productType === 'Storage Devices') {
    //     const storagesize = req.body.storagesize;
    //     variations.push({ name: 'Storage Size', value: storagesize });
    //   } else if (productType === 'Graphics Card') {
    //     const graphicscard = req.body.graphicscard;
    //     variations.push({ name: 'GPU Model', value: graphicscard });
    //   }
   
      
    //   // Create a new Product instance based on your model structure
    //   const newProduct = new Product({
    //     name: ProductName,
    //     description: Description,
    //     specifications: [Specification1, Specification2, Specification3, Specification4],
    //     images: imageFileNames,
    //     price: Price,
    //     discountPrice: DiscountAmount,
    //     type: productType,
    //     stock: AvailableQuantity,
    //     category: Category,
    //     brand: BrandName,
    //     tags: Tags.split(',').map((tag) => tag.trim()),
    //     variation:variations, // Include variations based on the selected product type
    //     // Add additional properties here based on your model structure
    //   });
  
    //   // Save the new product to the database
    //   await newProduct.save();
  
    //   // Redirect to a success page or the product listing page
    //   res.redirect('/admin/product');
    // } catch (error) {
    //   // Handle errors, e.g., show an error page
    //   console.error(error);
    //   res.status(500).send('Internal Server Error');
    // }
  


  getEditProduct: async (req, res) => {
    try{
    // const _idd = req.session.idd
    const _id = req.params._id;

    // const product = await Product.findOne({ _id });
    const product = await Product.findById(_id);
    console.log(product);
    if (!product) {
      // Handle the case where the product is not found, e.g., redirect to an error page.
      return res.render('admin/error', { message: 'Product not found' });
    }
    res.render("admin/editProduct", { product });
  }catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
},

    postEditProduct: async (req, res) => {
       // console.log(req.files);
      try {
        const _id  = req.params._id;
        const { ProductName, Description, Specification1, Specification2, Specification3, Specification4, Price, DiscountAmount, storagesize, graphicscard, AvailableQuantity, Category, BrandName, Tags } = trimProperties(req.body);
        console.log(req.body);
        const Tagss = req.body.Tags ? req.body.Tags : '';
        
        // Determine the product type from the form
        const productType = req.body.productType;
    
        // Create an object to hold variations based on the product type
        const variations = [];
    

        if (productType === 'Storage Devices') {
          const storagesizeValue = req.body.storagesize;
          variations.push({ name: 'Storage Size', value: storagesizeValue });
        } else if (productType === 'Graphics Card') {
          const graphicscardValue = req.body.graphicscard;
          variations.push({ name: 'GPU Model', value: graphicscardValue });
        }
        const imageFileNames = req.files.map((file) => file.filename);

    
        // Create an object to update the product
        const updatedProduct = {
          name: ProductName,
          description: Description,
          specifications: [Specification1, Specification2, Specification3, Specification4],
          image: imageFileNames,
          price: Price,
          discountPrice: DiscountAmount,
          type: productType,
          stock: AvailableQuantity,
          category: Category,
          brand: BrandName,
          tags: Tagss.split(',').map((tag) => tag.trim()),
          variation:variations,
          // variation: variations[0] ? variations[0].value : '',
        };
    
        // Find and update the product using the provided _id
        const result = await Product.findByIdAndUpdate(_id, updatedProduct, { new: true });
    
        if (result) {
          // Redirect to the product details page or any other page
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