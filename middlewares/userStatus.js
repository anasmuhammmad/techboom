const userStatusCheckMiddleware = (req, res, next) => {
    if (req.session.userAuth && req.session.userAuth.Status !== "Blocked") {
      // User is authenticated and not blocked, allow them to proceed
      next();
    } else {
      // User is blocked, prevent them from proceeding
      res.redirect('/blocked');
    }
  };
  
  module.exports = userStatusCheckMiddleware;