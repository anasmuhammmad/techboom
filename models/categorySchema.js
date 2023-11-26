
const mongoose = require('mongoose');

const CategoriesSchema =new mongoose.Schema({
    Name:{
        type:String,
        required: true,
        unique: true,
        uppercase: true
    },
    image:{
        type:String,
        required: true, 
    }
})


const Category = mongoose.model('Categories', CategoriesSchema);

module.exports = Category

