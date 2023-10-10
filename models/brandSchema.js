const mongoose = require('mongoose');

const BrandSchema =new mongoose.Schema({
    Name:{
        type:String,
        required: true
    },
})


const Brand = mongoose.model('brand', BrandSchema);

module.exports = Brand