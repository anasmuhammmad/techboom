const bcrypt = require('bcrypt');
const otpModel = require('../models/otpSchema');
const resendOTP = async (email) => {
    try {
      // Generate a new OTP
      const saltRounds = 10;
      const newOTP = `Resend OTP:${Math.floor(1000 + Math.random() * 9000)} `;
      const hashedOTP = await bcrypt.hash(newOTP, saltRounds);
  
      // Find the existing OTP record in the database
      let existingOTPRecord = await otpModel.findOne({ email });
  
      if (!existingOTPRecord) {
        // If there's no existing OTP record, create a new one
        const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 minutes
       existingOTPRecord = await otpModel.create({ email, otp: hashedOTP, expiresAt: expirationTimestamp });
      } else {
        // Update the existing OTP record with the new OTP and expiration timestamp
        const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 minutes
        existingOTPRecord = await otpModel.findOneAndUpdate(
          { email },
          { otp: hashedOTP, expiresAt: expirationTimestamp },
          {new:true}
        );
      }
  
      // Return the new OTP
      return existingOTPRecord.otp;
    } catch (error) {
      console.error(error);
      throw error; // Handle errors as needed
    }
  };

  module.exports = resendOTP;