const bcrypt = require('bcrypt');
const otpModel = require('../models/otpSchema');

async function generateOTP(email) {
  const saltRounds = 10;
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const hashedOTP = await bcrypt.hash(otp, saltRounds);

  // Calculate the expiration timestamp (e.g., 5 minutes from now)
  const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Create a new OTP record with the expiration timestamp
  await otpModel.create({ email, otp: hashedOTP, expiresAt: expirationTimestamp });


  // await otpModel.create({ email, otp: hashedOTP });
  return otp;
}

module.exports = generateOTP;