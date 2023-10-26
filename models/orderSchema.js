const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId },
  Status: { type: String, default:"Order Placed"},
  Items: [{
     ProductId: { type: Schema.Types.ObjectId , ref: "Product" },
     Quantity: { type: Number },
  }],
  PaymentMethod: {type: String},
  OrderDate: { type: String },
  TotalPrice: { type: Number },
  PaymentStatus: {type: String, default: "Pending"},
  CouponId: { type: Schema.Types.ObjectId },
  Address: { type: Schema.Types.ObjectId , ref :'User' },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders
