/**
 * Ensures that the current session has an authenticated user with the 'admin' role
 */
const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Access restricted. Administrator privileges required.');
  res.redirect('/admin/login');
};

module.exports = {
  ensureAdmin
};
