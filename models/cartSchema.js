const mongoose = require('mongoose');

const { Schema } = mongoose;

const CartSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId, ref:'User' , required: true },
  Items: [{
    ProductId: { type: Schema.Types.ObjectId, ref: 'Product'},
    Quantity: { type: Number },
    
  }],
  TotalAmount: { type: Number },

})

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart 

//   UserId: { type: Schema.Types.ObjectId }, // Use valid ObjectId
//   Items: [{
//     ProductId: { type: Schema.Types.ObjectId, ref: 'Products' }, // Use valid ObjectId
//     Quantity: { type: Number },
//   }],
//   TotalAmount: { type: Number },
// });