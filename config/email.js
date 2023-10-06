const nodemailer = require('nodemailer');
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'techboompage@gmail.com',
    pass: process.env.PASSWORD, 
  },
});

module.exports = transporter;