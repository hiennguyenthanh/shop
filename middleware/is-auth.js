module.exports = (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.status(401).json({ msg: "You need to log in first." });
  }
  next();
};
