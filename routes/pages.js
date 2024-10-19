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
    res.render('dashboards/student_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});



module.exports = router;