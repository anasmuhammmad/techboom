// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     port: 465,
//     host: 'smtp.gmail.com',
//     auth: {
//       user: 'techboompage@gmail.com',
//       pass: process.env.PASSWORD, 
//     },
//     secure:true,
// });

// function sendEmail(email, otp) {
//   const duration = '14 minutes';
//   const message = 'Enter This OTP to Continue';
//   const mailOptions = {
//     from: 'techboompage@gmail.com',
//     to: email,
//     subject: 'verify your email',
//     text: otp,
//     html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otp}</b></p><p>This Code <b>expires in ${duration} minutes(s)</b>.</p>`,
//   };

//   return new Promise((resolve, reject) => {
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//         reject(error);
//       } else {
//         console.log('Email sent successfully:', info.response);
//         resolve(info);
//       }
//     });
//   });
// }

// module.exports = sendEmail;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
        user: 'techboompage@gmail.com',
        pass: process.env.PASSWORD,
    },
    secure: true,
});

function sendEmail(email, otp) {
    const duration = '14 minutes';
    const message = 'Enter This OTP to Continue';
    const mailOptions = {
        from: 'techboompage@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        text: otp,
        html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otp}</b></p><p>This Code <b>expires in ${duration} minutes(s)</b>.</p>`,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error);
            } else {
                console.log('Email sent successfully:', info.response);
                resolve(info);
            }
        });
    });
}

module.exports = sendEmail;