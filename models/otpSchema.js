const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    mail: {type: String,
         },
    otp: String,
    createdAt : Date,
    expiresAt : Date,     
});
OTPSchema.plugin(beautifyUnique);
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;