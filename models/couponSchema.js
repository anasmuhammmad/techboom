const mongoose = require('mongoose');
const {Schema,ObjectId} = mongoose 

const CouponSchema = new mongoose.Schema({
    couponName: String,
    usedBy: [{
        userId: Schema.Types.ObjectId,
        limit: Number
    }],
    couponCode:{type:String,required:true},
    discountType: { type : String , enum : ['percentage', 'fixed'] }, 
    amount: Number,
    minAmount: Number,
    minAmountFixed: Number,
    maxAmount: Number,
    limit: Number,
    couponType: String,
    startDate: Date,
    endDate: Date,
    category: Array,
    applyType: String,
    status: { type : Boolean , default : true } ,
})

const coupons = mongoose.model("coupons",CouponSchema)
module.exports = coupons