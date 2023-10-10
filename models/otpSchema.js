const mongoose = require('mongoose');
// const beautifyUnique = require('mongoose-beautiful-unique-validation');
const Schema = mongoose.Schema;
const fiveMinutesFromNow = new Date();
fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);
const OTPSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    email: {type: String,
         },
    otp: String,

    
    expiresAt: { type: Date, default:fiveMinutesFromNow },
});
// OTPSchema.plugin(beautifyUnique);
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;