const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema")
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const adminAuth = require('../middlewares/adminAuth')
const bcrypt = require("bcrypt");

const Order = require("../models/orderSchema");
const Coupon = require("../models/couponSchema");
module.exports = {
  // admin:async (req,res)=>{
  //   const Email = "anasmuhammed444@gmail"
  //   const Password = "123"
  //   const hashedPassword = await bcrypt.hash(Password,10)
  //   const adminData = await Admin.create({Email:Email,Password:hashedPassword})
  //   console.log("created");
  // },



  // initial: (req, res) => {
  //     res.redirect("/admin/login");
  //   },
  getCoupon: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render("admin/showCoupon", { coupons });
    } catch (error) {
      console.log(error);
    }
  },
  
  getAddCoupon: async (req, res) => {
    try {
      res.render("admin/addCoupon");
    } catch (error) {}
  },

  
  postAddCoupon: async (req, res) => {
    try {
      console.log(req.body);
      if (req.body.discountType === "fixed") {
        req.body.amount = req.body.amount[1];
      } else if (req.body.discountType === "percentage") {
        req.body.amount = req.body.amount[0];
      }
      const coupon = await Coupon.create(req.body);
      if (coupon) {
        console.log("added to collection");
      } else {
        console.log("not added to collection");
      }
    } catch (error) {
      console.log(error);
    }
  },
  getLogin: async (req, res) => {
    if (req.session.adminAuth) {
      res.redirect("/admin/product");
    } else {
      res.render("admin/adminlogin",{err:" "});
    }
  },

    postLogin: async (req, res) => {
      // if (req.session.admin) {
      //   // If already authenticated, redirect to the desired page
      //   res.redirect("/admin/product");
      //   return;
      
      try {
        const Email = req.body.Email;
        console.log(req.body.Email);
        const Password = req.body.Password;
        const admin = await Admin.findOne({ Email: Email });
        console.log(admin);
        if (admin.Status === "Active") {
          const matchedPassword = await bcrypt.compare(Password, admin.Password);
          if (matchedPassword)
          // if(Password === admin.Password)
          {
            // const accessToken = jwt.sign(
            //   { admin: admin._id },
            //   process.env.ACCESS_TOKEN_SECRET,
            //   { expiresIn: 60 * 60 }
            // );
            // res.cookie("adminJwt", accessToken, { maxAge: 60 * 1000 * 60 });
            // req.session.admin = admin;
            req.session.adminAuth = true;
            req.session.admin = admin;
            res.redirect("/admin/product");
          } else {
            console.log("Password donot match");
            res.redirect("/admin/login");
          }
        } else {
          console.log("Admin is not active");
          res.redirect("/admin/login")
        }
      } catch (error) {
        console.log(error);
        res.redirect("/admin/login");
      }
    },

      logout : async (req, res) => {
        req.session.adminAuth = false;
          // res.clearCookie('adminJwt'); // Clear the access token cookie
          res.redirect('/admin/login'); // Redirect to the login page
      
      },
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

  // postAddProduct: async (req, res) => {
  //   console.log(req.body);
  //   console.log(req.files);
  //   try {
  //     const productType = req.body.productType;

  //     const variations = [];
      
  //     if (productType === "watches") {
  //       const watchColors = req.body.watches;
  //       variations.push({ value: watchColors });
  //     } else if (productType === "perfumes") {
  //       const perfumeQuantity = req.body.perfumes;
  //       variations.push({ value: perfumeQuantity });
  //     }
  //     req.body.Variation = variations[0].value;
  //     req.body.images = req.files.map((val) => val.filename);
  //     req.body.status = "In stock";
  //     req.body.display = "Active";
  //     req.body.updatedOn = new Date();
  //     const uploaded = await Product.create(req.body);
  //     res.redirect("/admin/product");
  //   } catch (error) {
  //     console.log(`An error happened ${error}`);
  //   }
  // },



  // postAddProduct: async(req,res)=>{
  //   try {

  //     console.log(req.files);
  //     // Extract product details from the form data
  //     const {
  //       ProductName,
  //       Description,
  //       Specification1,
  //       Specification2,
  //       Specification3,
  //       Specification4,
  //       image,
  //       Price,
  //       DiscountAmount,
  //       productType,
  //       storagesize, // Update the name to match the form input
  //       graphicscard, // Update the name to match the form input  
  //       AvailableQuantity,
  //       Category,
  //       BrandName,
  //       Tags,
  //     } = req.body;
  
  //        // Extract image file names from req.files
  //        const imageFileNames = req.files.map((file) => file.filename);

  //     // Create a new Product instance based on your model structure
  //     const newProduct = new Product({
  //         name: ProductName,
  //         description: Description,
  //         specifications: [Specification1, Specification2, Specification3, Specification4],
  //         images: imageFileNames,
  //         price: Price,
  //         discountPrice: DiscountAmount,
  //         type: productType,
  //         storageWanted: storagesize,
  //         gpuModel: graphicscard,
  //         stock: AvailableQuantity,
  //         category: Category,
  //         brand: BrandName,
  //         tags: Tags.split(',').map((tag) => tag.trim()),
  //         // Add additional properties here based on your model structure
  //       });
  
  //     // Save the new product to the database
  //     await newProduct.save();
  
  //     // Redirect to a success page or the product listing page
  //     res.redirect('/admin/product');
  //   } catch (error) {
  //     // Handle errors, e.g., show an error page
  //     console.error(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // },

getOrders: async (req,res)=>{
  const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
  const perPage = 10; // Number of items per page
  const skip = (page - 1) * perPage;

  // Query the database for products, skip and limit based on the pagination
  const order = await Order.find()
      .skip(skip)
      .limit(perPage).lean();

  const totalCount = await Order.countDocuments();

  res.render('admin/adminOrders', {
      order,
      currentPage: page,
      perPage,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
  });

},
getOrderDetails: async (req,res)=>{
  try {
    const orderId = req.params._id
    const orderDetails = await Order.findOne({_id:orderId}).populate('Items.ProductId')
    res.render('admin/adminOrderDetails',{order:orderDetails})
  } catch (error) {
    console.log(error);
  }
},
putUpdateStatus: async (req,res)=>{
  console.log("hereee");
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
      // Update the order status in the database
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { Status: status }, { new: true });

      // If the status is "Delivered," update the payment status to "paid"
      if (status.toLowerCase() === 'delivered') {
          updatedOrder.PaymentStatus = 'Paid';
      }else{
          updatedOrder.PaymentStatus = 'Pending';
      }

      // If the status is "rejected," update the payment status to "order rejected"
      if (status.toLowerCase() === 'rejected') {
          updatedOrder.PaymentStatus = 'order rejected';
      }

      // Save the changes to the order
      await updatedOrder.save();

      // Respond with the updated order
      res.json(updatedOrder);
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
   

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
    } = req.body;

    // Extract image file names from req.files
    const imageFileNames = req.files.map((file) => file.filename);

    const productType = req.body.productType;
    // Create an object to hold variations based on the product type
    const variations = [] ;

    if (productType === 'Storage Devices') {
      const storagesize = req.body.storagesize;
      variations.push({ name: 'Storage Size', value: storagesize });
    } else if (productType === 'Graphics Card') {
      const graphicscard = req.body.graphicscard;
      variations.push({ name: 'GPU Model', value: graphicscard });
    }

    // Create a new Product instance based on your model structure
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
      variation:variations, // Include variations based on the selected product type
      // Add additional properties here based on your model structure
    });

    // Save the new product to the database
    await newProduct.save();

    // Redirect to a success page or the product listing page
    res.redirect('/admin/product');
  } catch (error) {
    // Handle errors, e.g., show an error page
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
},
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
        const { ProductName, Description, Specification1, Specification2, Specification3, Specification4, Price, DiscountAmount, storagesize, graphicscard, AvailableQuantity, Category, BrandName, Tags } = req.body;
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
  //   try {
  //     const productType = req.body.productType;
      
  //     const variations = [];
  //     console.log('kitnnundo');
  //     if (productType === "storagesize") {
  //       const watchColors = req.body.watches;
  //       variations.push({ value: watchColors });
  //     } else if (productType === "gpumodel") {
  //       const perfumeQuantity = req.body.perfumes;
  //       variations.push({ value: perfumeQuantity });
  //     }
  //     req.body.Variation = variations[0].value;
  //     req.body.images = req.files.map((val) => val.filename);
  //     req.body.Status = "In stock";
  //     req.body.Display = "Active";
  //     req.body.UpdatedOn = new Date();
  //     const uploaded = await Product.findByIdAndUpdate(_id, req.body);
  //     res.redirect("/admin/product");
  //   } catch (error) {
  //     console.log(`An error happened ${error}`);
  //   }
  


  getUser: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
      const perPage = 10; // Number of items per page
      const skip = (page - 1) * perPage;

      const users = await User.find().skip(skip).limit(perPage).lean();
      const totalCount = await User.countDocuments();

      res.render("admin/manageUsers", {
        users,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });
    } catch (error) {
      res.send(error);
    }
  },

  blockUser: async (req, res) => {
    try {
      const _id = req.params._id;

      const userData = await User.findOne({ _id: _id });
      console.log(userData);
      if (userData.Status === "Active") {
        const user = await User.findByIdAndUpdate(_id, { Status: "Blocked" });
        const alertMessage = "This user is being blocked";
        req.session.alert = alertMessage;
        res.redirect("/admin/userslist");
      } else if (userData.Status === "Blocked") {
        const user = await User.findByIdAndUpdate(_id, { Status: "Active" });
        const alertMessage = "This user is being unblocked";
        req.session.alert = alertMessage;
        res.redirect("/admin/userslist");
      }
    } catch (error) {
      const alertMessage = "This is an alert message.";
      req.session.alert = alertMessage;
      res.redirect("/admin/userslist");
    }
  },





  getCategoriesAndBrands: async (req, res) => {
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("admin/categoriesAndBrands", { categories, brands });
  },

  getAddCategory: async (req, res) => {
    res.render("admin/addcategory");
  },


  postAddCategory: async (req, res) => {
    try {
      // const imageBuffer = req.file.buffer; // Get the image data from multer
      const imageFileName = req.file.filename;

      const newCategory = new Category({
        Name: req.body.Name,
        image : imageFileName
      });


      // Save the newCategory to the database
      let data = await newCategory.save();
      req.session.idd = data;

      req.flash('success', 'Category added successfully');
      // Redirect or send a success response
      res.redirect('/admin/categoriesandbrands');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error Adding the Category');
      res.redirect('/admin/categoriesandbrands');
    }
  },

  // getEditCategory: async (req, res) => {
  //   const _id = req.params._id;
  //   const category = await Category.findById(_id);
  //   console.log(_id);
  //   res.render("admin/editCategory", { category });
  // },


  getEditCategory: async (req, res) => {
    try {
      const _id = req.params.id;
      const image = req.session.idd ;

      console.log(_id);
      const category = await Category.findById(_id);
      if (!category) {
        return res.status(404).send('Category not found'); // Handle not found case
      }
      res.render('admin/editCategory', { category });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error'); // Handle server error
    }
  },

    postEditCategory: async (req, res) => {
      try {
      const _id = req.params.id  ;
      const imagee = req.session.idd ;
        console.log(_id);
        const {Name} = req.body;
       
        const image = req.file;        // Create an object to represent the updated category data
        
        console.log(Name);
        console.log(image); // Log the image details
        const updatedCategoryData = {};
        if (Name) {
          updatedCategoryData.Name = Name;
        }
    
        if (image) {
          updatedCategoryData.image = image.filename  ;
        }
    
        // Update the category in your database with the new data
        const updatedCategory = await Category.findByIdAndUpdate(_id, updatedCategoryData, {new: true});
        if (!updatedCategory) {
          return res.status(404).send('Category not found');
        }   

        // Redirect to the category list or wherever you prefer
        res.redirect('/admin/categoriesandbrands');
      }catch (error) {
        console.error(error);
        res.status(500).send('Server Error'); // Handle server error
      }
    },



  getAddBrand: (req, res) => {
    res.render("admin/addbrand")
  },

  postAddBrand: async (req, res) => {
    try {
      const brand = await Brand.create(req.body)
      res.redirect("/admin/categoriesandbrands")
    } catch (error) {
      console.log(error);
      req.flash("error", "Error Adding the Brand");
      res.redirect("/admin/categoriesandbrands");
    }

  },

}