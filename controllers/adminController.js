const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema")
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const bcrypt = require("bcrypt");


module.exports = {
    // admin:async (req,res)=>{
    //   const Email = "anasmuhammed444@gmail"
    //   const Password = "123"
    //   const hashedPassword = await bcrypt.hash(Password,10)
    //   const adminData = await Admin.create({Email:Email,Password:hashedPassword})
    //   console.log("created");
    // },
    


    initial: (req, res) => {
        res.redirect("/admin/login");
      },
    
      getLogin: async (req, res) => {
        res.render("admin/adminLogin");
      },
    
      postLogin: async (req, res) => {
        try {
          const Email = req.body.Email;
          console.log(req.body.Email);
          const Password = req.body.Password;
          const admin = await Admin.findOne({Email: Email});
          console.log(admin);
          if (admin.Status === "Active") {
            const matchedPassword = await bcrypt.compare(Password, admin.Password);
            if (matchedPassword) {
              const accessToken = jwt.sign(
                { admin: admin._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 60 * 60 }
              );
              res.cookie("adminJwt", accessToken, { maxAge: 60 * 1000 * 60 });
              req.session.admin = admin;
              res.redirect("/admin/product");
            } else {
              console.log(error);
              res.redirect("/admin/login");
            }
          }else{
              console.log(error);
              res.redirect("/admin/login")
          }
        } catch (error) {
          console.log(error);
          res.redirect("/admin/login");
        }
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


    getAddProduct: async (req, res) => {
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


      getEditProduct: async (req, res) => {
        const _id = req.params._id;
        const product = await Product.find({ _id });
        console.log(product);
        res.render("admin/editProduct", { product: product[0] });
      },
      
      postEditProduct: async (req, res) => {
        const _id = req.params._id;
        console.log(req.body);
        console.log(req.files);
        try {
          const productType = req.body.productType;
    
          const variations = [];
    
          if (productType === "watches") {
            const watchColors = req.body.watches;
            variations.push({ value: watchColors });
          } else if (productType === "perfumes") {
            const perfumeQuantity = req.body.perfumes;
            variations.push({ value: perfumeQuantity });
          }
          req.body.Variation = variations[0].value;
          req.body.images = req.files.map((val) => val.filename);
          req.body.Status = "In stock";
          req.body.Display = "Active";
          req.body.UpdatedOn = new Date();
          const uploaded = await Product.findByIdAndUpdate(_id, req.body);
          res.redirect("/admin/product");
        } catch (error) {
          console.log(`An error happened ${error}`);
        }
      },
    

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
        res.render("admin/categoriesAndBrands", { categories,brands });
      },

      getAddCategory: async (req, res) => {
        res.render("admin/addcategory");
      },
    
      postAddCategory: async (req, res) => {
        try {
          console.log(req.file);
          req.body.image = req.file.filename;
          const uploaded = await Category.create(req.body);
          res.redirect("/admin/categoriesandbrands");
        } catch (error) {
          console.log(error);
          req.flash("error", "Error Adding the Category");
          res.redirect("/admin/categoriesandbrands");
        }
      },
    
      getEditCategory: async (req, res) => {
        const _id = req.params._id;
        const category = await Category.findById(_id);
        console.log(id);
        res.render("admin/editCategory", { category });
      },
    
      getAddBrand: (req,res)=>{
        res.render("admin/addbrand")
      },

      postAddBrand: async (req,res) => {
        try {
          const brands = await Brand.create(req.body)
          res.redirect("/admin/categoriesandbrands")
        } catch (error) {
          console.log(error);
          req.flash("error", "Error Adding the Brand");
          res.redirect("/admin/categoriesandbrands");
        }
    
      },

}