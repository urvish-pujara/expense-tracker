const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const token = req?.headers?.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied' });
  }
  else {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedToken.user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token, access denied' });
    }
  }
};

module.exports = { authenticateUser };
