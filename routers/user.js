const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middlewares/userAuth')
const UserModel = require('../models/userSchema'); 
const nodemailer = require('nodemailer')

// product list
const productList = [
    { name: 'Product 1', description: 'Description 1', price: 10.99 },
    { name: 'Product 2', description: 'Description 2', price: 19.99 },
    
  ];

// Routes
app.get('/', async(req, res) => {
       
 
          res.render("user/user-shop",{productList, err:""});
        }
      
); 

app.get('/signup', function (req, res) {
    const error = '';
    res.render("user/user-signup", { error });
});

app.post('/signup',async (req, res) => {
        try {
          const salt = await bcrypt.genSalt();
          req.body.Password = await bcrypt.hashSync(req.body.Password, salt);
          const userdata = await UserModel.create(req.body)
          if(userdata){
              req.session.auth = true;
              req.session.user = userdata
              res.redirect('/usershop')
          }
        } catch (error) {
          if (error.code === 11000) {
            res.render("user/usersignup", { err: "Email already exist" });
          }
        }
      }
);
app.get('/otp',async (req, res) => {
 res.render('user/user-otpveri')
}
);
app.get('/usershop', function (req, res) {
    // Replace this with the actual product list data
    const productList = [
        { name: 'Product 1', description: 'Description 1', price: 10.99 },
        { name: 'Product 2', description: 'Description 2', price: 19.99 },
        // Add more products here
    ];

    res.render('user/user-shop', { productList });
});

module.exports =app;