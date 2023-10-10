const nodemailer = require('nodemailer');
require("dotenv").config();
const OTP = require('../models/otpSchema')
const transporter = nodemailer.createTransport({
  port: 465,
  host: 'smtp.gmail.com',
  auth: {
    user: 'techboompage@gmail.com',
    pass: process.env.PASSWORD, 
  },
  secure:true,
});




module.exports = transporter