const User = require('../models/userSchema')
const userStatusCheckMiddleware = async (req, res, next) => {
  const user = await User.findById( req.session.userId)
   if(user&&user.Status==="Blocked")
   {
    req.session.userAuth = false;
    req.flash('error', 'Your account is blocked. You cannot make purchases.');
    res.locals.userBlocked = true;
    res.redirect('/homepage')
   }
   else
   {
    res.locals.userBlocked = false;
    next();
   }
  };
  
  module.exports = userStatusCheckMiddleware;