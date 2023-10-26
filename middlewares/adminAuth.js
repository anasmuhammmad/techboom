const authMiddleware = (req, res, next) => {
    if (req.session.adminAuth) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated, redirect to login page
      res.redirect('/admin/login');
    }
  };
  
module.exports = {authMiddleware};

// const jwt = require('jsonwebtoken')
// require('dotenv').config()

// module.exports = {
//     adminTokenAuth: async (req, res, next) => {
//         try {
//             const token = req.cookies.adminJwt
//             if (token) {
//                 jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
//                     if (err) {
//                         // Token verification failed
//                         req.session.admin = false;
//                         res.redirect('/admin/login')
//                     } else {
//                         req.session.admin = admin
//                         next()
//                     }
//                 })
//             } else {
//                 req.session.admin = false
//                 res.redirect('/admin/login')
//             }
//         } catch (error) {
//             console.log(error);
//             res.redirect('/admin/login')
//         }
//     },

//     adminExist: (req, res, next) => {
//         try {
//             const token = req.cookies.adminJwt;
//             if (token) {
//                 jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//                     if (err) {
//                         next();
//                     }
//                     else {
//                         res.redirect('/admin/product')
//                     }
//                 })
//             }
//             else {
//                 next();
//             }
//         } catch (error) {
//             console.log(error);
//             next();
//         }
//     },
// }