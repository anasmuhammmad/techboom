const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const razorpay = require("../utility/razorpay");
const Coupon = require('../models/couponSchema');
const User = require('../models/userSchema');


module.exports = {
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
          if (req.body.couponName.trim() === '' || req.body.couponCode.trim() === '') {
            return res.json({ error: "Name and code cannot have empty spaces" });
          }
          if (req.body.limit <= 0 || req.body.minAmountFixed <= 0 || req.body.minAmount <= 0 || req.body.maxAmount <= 0) {
            return res.json({ error: "Usage limit and minimum amount cannot be 0 or negative" });
          }
          if(req.body.amount <= 0 ){
            return res.json({ error: "COUPON amount cannot be 0 or negative" })
          }

          const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    // Check if start date is today's date or in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      return res.json({ error: "Start date must be today's date or in the future" });
    }

    // Check if end date is after the start date
    if (endDate <= startDate) {
      return res.json({ error: "End date must be after the start date" });
    }



          const existingCoupon = await Coupon.findOne({ $or: [{ coupoName: req.body.couponName }, { couponCode: req.body.couponCode }] });
    if (existingCoupon) {
      return res.json({ error: "Coupon with the same name or code already exists" });
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



 checkCoupon : async(req,res)=>{
    try {
      const userId = req.session.userId
      const user = await User.findById(userId);
      if(user&&user.Status=="Blocked"){
        
        req.flash('error', 'Your account is blocked. You cannot make purchases.');
        return res.redirect('/homepage'); // Redirect to a suitable page.
      }
      else
  {
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
                      discount = Math.abs(discount);
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
                      discount = Math.abs(discount);
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
    }
    } catch (error) {
      console.log(error);
      res.json({ error: "Some error Occurred" });
    }
  },

  getCoupons: async(req,res)=>{
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const coupons = await Coupon.find()
    res.render('user/coupons',{user,coupons})
  }
}