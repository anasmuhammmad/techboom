const nodemailer = require('nodemailer')
const OTP = require('../models/otpSchema')
require('dotenv').config()


//generate OTP
module.exports = {
    generateOTP : () => {
        return `${Math.floor(1000 + Math.random() * 9000)}`;
    },
    sendOTP :async (req,res,Email,otpToBeSent)=>{
        try{
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'tickerpage@gmail.com',
                    pass: 'vfte pvyn gvat uylk'
                },
                secure: true,
            });

        const duration = 5; // Set the OTP expiration duration in hours
        const newOTP = new OTP({
            Email: Email,
            otp: otpToBeSent,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration * 60000, // Convert hours to milliseconds
        });

        // Save the OTP record to the database
        const createdOTPRecord = await newOTP.save();

        // Mail data
        const message = "Enter This OTP to Continue";
        const mailData = {
            from: 'tickerpage@gmail.com',
            to: Email,
            subject: 'OTP FROM TICKER',
            html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration} minutes(s)</b>.</p>`,
        }

        transporter.sendMail(mailData, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Success');
        });
        res.redirect('/emailVerification');
    }catch (error) {
        console.error(error);
        res.redirect('/signup')
    }
    },

    resendOTP : async (req,res,Email,otpToBeSent)=>{
        try{
            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: 'tickerpage@gmail.com',
                    pass: 'vfte pvyn gvat uylk'
                },
                secure: true,
            });

        const duration = 1; 

        const message = "Enter This OTP to Continue";
        const mailData = {
            from: 'tickerpage@gmail.com',
            to: Email,
            subject: 'OTP FROM TICKER',
            html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration} hour(s)</b>.</p>`,
        }

        // Sending mail
        transporter.sendMail(mailData, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Success');
        });
        res.redirect('/emailVerification',{error:req.session.error});
    }catch (error) {
        console.error(error);
        res.status(500).send("Error sending OTP");
    }


    }
}