const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
        name: {
            type : String,
            required : true,    
        },
        specifications: {
            type : String,
            required : true,  
        },
        type: [{
            type : String, 
        }],
        images: [{
             type: String,

        }],
        stock: {
            type:Number,
            required: true,
            min : 0,
            max : 255,
        },
        rating:{
            type: String,
            required: true,
        },
        review: { 
            type : String,
            required: true,
        }
})