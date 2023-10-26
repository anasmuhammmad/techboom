const mongoose = require('mongoose');

const BrandSchema =new mongoose.Schema({
    Name:{
        type:String,
       
    },
})


const Brand = mongoose.model('brand', BrandSchema);

module.exports = Brand