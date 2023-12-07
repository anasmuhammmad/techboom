const mongoose = require('mongoose');
const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;
  const productSchema = mongoose.Schema({
          name: {
              type : String,
              required : true,    
          },
          description: {
            type:String,
          },
          Specification1: {
            type: String
          },
          Specification2: {
            type: String
          },
          Specification3: {
            type: String
          },
          Specification4: {
            type: String
          },

          type: [{
              type : String, 
          }],
          images: {
              type: Array,

          },
          brandName:{
         type: String,
          },
        storageWanted:{
          typeof: String,
        },
        gpuModel:{
          type: String,
        },
        stock: {
            type:Number,
            required: true,
            min : 0,
            max : 255,
        },
        price: {
            type: Number,
            required: true,
        },
        discountPrice: {
            type: Number,
          },
        // offerAmount:{
        //   type: Number,
        // },
        rating:{
            type: String,
            // required: true,
        },
        status: {
            type: String,
            default: 'Active',
            // required: true,
          },
        review: { 
            type : String,
            // required: true,
        },
        tags: {
            type: Array,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref:'Categories',
            required: true,
     
          },
        display: {
            type: String,
            // required: true
          },
        updatedDate:{
          type: Date,
          default: Date.now,
        },
        variation: {
            type: Array,
          },
        deletedAt: { 
            type: Date
          }, 
})
const Product = mongoose.model('Product', productSchema);

module.exports = Product;


