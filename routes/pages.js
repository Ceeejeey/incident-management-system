const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

// Basic Route to Test Server
router.get('/', (req, res) => {
    res.render('index');
});


router.get('/signin', (req, res) => {
    res.render('signin');
})
router.get('/signup', (req, res) => {
    res.render('signup');
})

// Dashboard route
router.get('/dashboards/student_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }
    
    console.log(req.user.email);
    res.render('dashboards/student_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});
//signout route
router.get('/signout', (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/signin');
});


module.exports = router;