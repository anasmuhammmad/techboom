const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const BannerSchema = new Schema({
  BannerName: { type: String },
  Image: { type: String },
  Video:{type: String},
  Status :{type :String,default:"Disabled"},
  CroppedImage: {type: String},
  Date: { type: Date },
});

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner