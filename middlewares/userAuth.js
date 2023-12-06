
const userauthMiddleware = (req, res, next) => {
  const user = req.session.userAuth;

  if (user) {
      // User is authenticated
      if (user.Status !== "Blocked") {
          // User is authenticated and not blocked, allow them to proceed
          res.locals.user = user; // Make user information available to templates
          next();
      } else {
          // User is authenticated but blocked, redirect to blocked page
          res.redirect('/blocked');
      }
  } else {
      // User is not authenticated, redirect to login page
      res.redirect('/login');
  }
  };
  
module.exports = {userauthMiddleware};