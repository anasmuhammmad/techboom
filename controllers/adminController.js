const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema")
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const adminAuth = require('../middlewares/adminAuth.js')
const bcrypt = require("bcrypt");
const pdf = require("../utility/pdf")
const orderHelper = require("../helpers/orderHelpers")
const exceljs = require("exceljs");
const Order = require("../models/orderSchema");
const moment = require("moment");
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
      console.log("hello");
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
      if(req.body.amount <= 0 ){
        return res.json({ error: "COUPON amount cannot be 0 or negative" })
      }
      const coupon = await Coupon.create(req.body);
      if (coupon) {
        console.log("added to collection");
        res.json({ success: true });
      } else {
        console.log("not added to collection");
        res.json({ error: "COUPON already consist" });
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
  getDashboard : async (req, res) => {
    res.render("admin/dashboard");

  } ,     
  getCount: async (req, res) => {
    try {
      const orders = await Order.find({
        Status: {
          $nin:["returned","Cancelled","Rejected"]
        }
      });
      const orderCountsByDay = {};
      const totalAmountByDay = {};
      const orderCountsByMonthYear = {};
      const totalAmountByMonthYear = {};
      const orderCountsByYear = {};
      const totalAmountByYear = {};
      let labelsByCount;
      let labelsByAmount;
      let dataByCount;
      let dataByAmount;
      console.log('outside')
      orders.forEach((order) => {
        console.log('inside')
        const orderDate = moment(order.OrderDate, "ddd, MMM D, YYYY h:mm A");
        const dayMonthYear = orderDate.format("YYYY-MM-DD");
        const monthYear = orderDate.format("YYYY-MM");
        const year = orderDate.format("YYYY");
        
        if (req.url === "/admin/count-orders-by-day") {
          console.log("count");
          if (!orderCountsByDay[dayMonthYear]) {
            orderCountsByDay[dayMonthYear] = 1;
            totalAmountByDay[dayMonthYear] = order.TotalPrice
          } else {
            orderCountsByDay[dayMonthYear]++;
            totalAmountByDay[dayMonthYear] += order.TotalPrice
          }
          const ordersByDay = Object.keys(orderCountsByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              count: orderCountsByDay[dayMonthYear],
            })
          );
          const amountsByDay = Object.keys(totalAmountByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              total: totalAmountByDay[dayMonthYear],
            })
          );
          amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
          ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
          labelsByCount = ordersByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
          labelsByAmount = amountsByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
          dataByCount = ordersByDay.map((entry) => entry.count);
          dataByAmount = amountsByDay.map((entry) => entry.total);


        } else if (req.url === "/admin/count-orders-by-month") {
          if (!orderCountsByMonthYear[monthYear]) {
            orderCountsByMonthYear[monthYear] = 1;
            totalAmountByMonthYear[monthYear] = order.TotalPrice;
          } else {
            orderCountsByMonthYear[monthYear]++;
            totalAmountByMonthYear[monthYear] += order.TotalPrice;
          }
        
          const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              count: orderCountsByMonthYear[monthYear],
            })
          );
          const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              total: totalAmountByMonthYear[monthYear],
            })
          );
          console.log("by monthhh",amountsByMonth);
        
          ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          labelsByAmount = amountsByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          dataByCount = ordersByMonth.map((entry) => entry.count);
          dataByAmount = amountsByMonth.map((entry) => entry.total);
        } else if (req.url === "/admin/count-orders-by-year") {
          // Count orders by year
          if (!orderCountsByYear[year]) {
            orderCountsByYear[year] = 1;
            totalAmountByYear[year] = order.TotalPrice;
          } else {
            orderCountsByYear[year]++;
            totalAmountByYear[year] += order.TotalPrice;
          }
        
          const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
            _id: year,
            count: orderCountsByYear[year],
          }));
          const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
            _id: year,
            total: totalAmountByYear[year],
          }));
        
          ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByYear.map((entry) => entry._id);
          labelsByAmount = amountsByYear.map((entry) => entry._id);
          dataByCount = ordersByYear.map((entry) => entry.count);
          dataByAmount = amountsByYear.map((entry) => entry.total);
        }
      });


      res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
    } catch (err) {
      console.error(err);
    }
  },

  getOrdersAndSellers: async (req, res) => {
    try {
      const latestOrders = await Order.find().sort({ _id: -1 });
      const bestSeller = await Order.aggregate([
        {
          $match: {
            Status: 'Delivered',
          },
        },
        {
          $unwind: "$Items",
        },
        {
          $group: {
            _id: "$Items.ProductId",
            totalCount: { $sum: "$Items.Quantity" },
          },
        },
        {
          $sort: {
            totalCount: -1,
          },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
      ]);
      console.log(bestSeller)
      if (!latestOrders || !bestSeller) throw new Error("No Data Found");
      res.json({ latestOrders, bestSeller });
    } catch (error) {
      console.log(error);
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
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;
  const order = await Order.find().skip(skip).limit(perPage).lean();
  const returnRequestedCount = await Order.aggregate([
    {
      $match: {
        Status: 'Return Requested',
      },
    },
    {
      $count: 'count',
    },
  ]);
  const numberOfRequest = returnRequestedCount[0]?.count
  const totalCount = await Order.countDocuments();

  res.render("admin/adminOrders", {
    order,
    numberOfRequest,
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

getReturnRequests: async (req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;
    const order = await Order.find({Status: 'Return Requested' }).skip(skip).limit(perPage)
    const totalCount = await Order.countDocuments({Status: 'Return Requested' });
    res.render('admin/returnRequests',{
      order,
      totalCount,
    currentPage: page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
    })
  } catch (error) {
    console.log(error);
  }
},


getHandleRequest: async (req,res)=>{
  try {
    const orderId = req.body.orderId
    const input = req.body.input
    if(input === 'accept'){
      const order = await Order.findById(orderId).populate('Items.ProductId')
      const _id = order.UserId
      if(order.PaymentStatus === 'Paid'){
        await User.findOneAndUpdate(
          { _id: _id },
          { $inc: { WalletAmount: order.TotalPrice } }
        );
      }
      let status = "Returned"
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { Status: status,PaymentStatus: "Refunded" },
        { new: true }
      );
      console.log("orderr",order.Items);
      order.Items.forEach(async(item)=>{
        await Product.updateOne(
          {_id : item.ProductId},
          {$inc:{stock: item.Quantity}}
        )
      })
    }else{
      let status = "Return Rejected"
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { Status: status },
        { new: true }
      );
    }
    res.json({success: true})

  } catch (error) {
    console.log(error);
  }
},

getDownloadSalesReport: async (req,res)=>{
  console.log(req.body);
  try {
    const startDate = req.body.startDate
    const format = req.body.fileFormat
    const endDate = req.body.endDate
    const orders = await Order.find({
      PaymentStatus: 'Paid',
    }).populate('Items.ProductId')

    const totalSales = await Order.aggregate([
      {
      $match:{
        PaymentStatus: 'Paid',
      }
  },
  {
    $group: {
      _id: null,
      totalSales: {$sum: '$TotalPrice'}
    }
  }
])
const sum = totalSales.length > 0 ? totalSales[0].totalSales : 0;
if(format === 'pdf'){
pdf.downloadPdf(req,res,orders,startDate,endDate,sum)
}
else if(format === 'excel'){
const workbook = new exceljs.Workbook();
const worksheet = workbook.addWorksheet('Sales Report');

// Add headers
worksheet.columns = [
  { header: 'User ID', key: 'UserId', width: 10 },
  { header: 'Order ID', key: '_id', width: 15 },
  { header: 'Date', key: 'OrderDate', width: 15 },
  { header: 'Total Amount', key: 'TotalPrice', width: 15 },
  { header: 'Payment Method', key: 'PaymentMethod', width: 20 },
  // { header: 'Total Sales', key: 'TotalSales', width: 20 },
  // ... add more headers as needed
];

// Add data
orders.forEach(order => {
  order.Items.forEach(item => {
    worksheet.addRow({
      UserId: order.UserId,
      _id: order._id,
      OrderDate: order.OrderDate,
      TotalPrice: order.TotalPrice.toFixed(2),
      PaymentMethod: order.PaymentMethod,
      // sum:order.sum,
      // ... add more data as needed
    });
  });
});

// Set content type and disposition for Excel download
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'attachment; filename=SalesReport.xlsx');

// Write workbook to response
await workbook.xlsx.write(res);


}



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

    
 getReturnRequest: async ( req,res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const perPage = 10;
      const skip = (page - 1) * perPage;
      const order = await Order.find({Status: 'Return Requested' }).skip(skip).limit(perPage)
      const totalCount = await Order.countDocuments({Status: 'Return Requested' });
      res.render('admin/returnRequests',{
        order,
        totalCount,
      currentPage: page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
      })
    } catch (error) {
      console.log(error);
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
    res.render("admin/categoriesAndBrands", { categories, brands, error: req.flash('error'),success: req.flash('success') });
  },

  getAddCategory: async (req, res) => {
    res.render("admin/addcategory",{error: req.flash('error'),success: req.flash('success')});
  },


  postAddCategory: async (req, res) => {
    try {
      console.log(req.file);
      req.body.image = req.file.filename;
      const uploaded = await Category.create(req.body);
      res.redirect("/admin/categoriesandbrands");
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
          req.flash("error", "Category already exist");
          res.redirect("/admin/addcategory");
      } else {
        req.flash("error", "Error Adding the Category");
        res.redirect("/admin/categoriesandbrands");

      }
    }
  },




  // try {
    //   // const imageBuffer = req.file.buffer; // Get the image data from multer
    //   const imageFileName = req.file.filename;

    //   const newCategory = new Category({
    //     Name: req.body.Name,
    //     image : imageFileName
    //   });


    //   // Save the newCategory to the database
    //   let data = await newCategory.save();
    //   req.session.idd = data;

    //   req.flash('success', 'Category added successfully');
    //   // Redirect or send a success response
    //  return res.redirect('/admin/categoriesandbrands');
    // } catch (error) {
      
    //   req.flash('error','Error Adding the Category,try to add both fields properly');
    //   return res.redirect('/admin/addcategory');
    // }







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
      const errorMessages = req.flash('error');
      console.log(_id);
      const category = await Category.findById(_id);
      if (!category) {
        return res.status(404).send('Category not found'); // Handle not found case
      }
      res.render('admin/editCategory', { category, errorMessages});
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
        }else {
          // If image is empty, 
          req.flash('error','Image is required for category update.')
          return res.redirect('/admin/edit/${_id}')
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