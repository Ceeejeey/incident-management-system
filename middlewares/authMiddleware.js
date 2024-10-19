// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.refreshToken;
 
    if (!token) {
        return res.redirect('/signin'); // No token found, redirect to sign-in
    }
 
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            // If refresh token is invalid or expired, clear the cookie and redirect
            res.clearCookie('refreshToken');
            return res.redirect('/signin');
        }
 
        req.user = user;
        next(); // Proceed to the dashboard or next middleware
    });
};
 

module.exports = authenticateToken;