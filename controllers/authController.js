const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/config');
const bcrypt = require('bcryptjs');

// Sign-up logic (assuming this is above the sign-in logic)
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        res.send('User registered successfully');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Error while signing up');
    }
});

// Sign-in logic
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check for an existing refresh token in cookies
        const existingRefreshToken = req.cookies.refreshToken;

        if (existingRefreshToken) {
            try {
                // Verify the existing refresh token
                jwt.verify(existingRefreshToken, process.env.JWT_REFRESH_SECRET);

                // If the token is valid, redirect to dashboard without generating a new token
                return res.redirect('/dashboards/student_dashboard');
            } catch (err) {
                // If the token is expired or invalid, proceed with refreshing it
                console.log('Invalid refresh token, issuing a new one...');
            }
        }

        // If no valid refresh token is found, generate new tokens
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Redirect to the dashboard after sign-in
        return res.redirect('/dashboards/student_dashboard');
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'An error occurred during sign-in' });
    }
});


module.exports = router;