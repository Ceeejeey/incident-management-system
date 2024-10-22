const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

// Basic Route to Test Server
router.get('/', (req, res) => {
    res.render('index');
});

// Sign-in and Sign-up routes
router.get('/signin', (req, res) => {
    res.render('signin');
})

router.get('/signup', async (req, res) => {
    try {
        // Check if an admin already exists
        const [adminCheck] = await pool.query('SELECT COUNT(*) AS adminCount FROM users WHERE role = "admin"');
        const adminExists = adminCheck[0].adminCount > 0; // true if admin exists

        // Render the signup page and pass adminExists variable
        res.render('signup', { adminExists });
    } catch (error) {
        console.error('Error checking for admin:', error);
        res.status(500).send('Error loading signup page');
    }
});

//staff Dashboard route
router.get('/dashboards/staff_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.role);
    res.render('dashboards/staff_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});

//admin Dashboard route
router.get('/dashboards/admin_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.role);
    res.render('dashboards/admin_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});

//student Dashboard route
router.get('/dashboards/student_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.email);
    res.render('dashboards/student_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});

//incident Report route
router.get('/incident/incidentReport', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.email);
    res.render('incident/incidentReport', {
        user: req.user // Pass user info to the dashboard
    });
});

//signout route
router.get('/signout', (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/signin');
});


module.exports = router;