const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

module.exports = {
    authMiddleware,
};
