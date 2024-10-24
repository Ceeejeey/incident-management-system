const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/config');
const bcrypt = require('bcryptjs');

// Sign-up logic
router.post('/signup', async (req, res) => {
    const { name ,email, role ,password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name ,email,role, password) VALUES (?, ?, ? ,?)', [name , email, role, hashedPassword]);
        res.redirect('/signin');
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
        console.log('User:', user);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check for existing refresh token in cookies
        const existingRefreshToken = req.cookies.refreshToken;
        console.log('Existing refresh token:', existingRefreshToken);

        if (existingRefreshToken) {
            try {
                // Verify existing refresh token
                const decoded = jwt.verify(existingRefreshToken, process.env.JWT_REFRESH_SECRET);

                // If the token is valid, no need to generate a new one
                console.log('Valid refresh token, redirecting to dashboard...');
                return res.json({ existingRefreshToken, user });
            } catch (err) {
                // If the refresh token is expired or invalid, proceed with issuing a new one
                console.log('Invalid or expired refresh token, issuing a new one...');
            }
        }

        // No valid refresh token found, issue new tokens
        const accessToken = jwt.sign({ id: user.user_id, email: user.email , name: user.name , role:user.role}, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.user_id, email: user.email , name: user.name , role:user.role}, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Store refresh token securely in cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Secure and not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production', // Use secure cookie in production
            sameSite: 'Strict' // Helps mitigate CSRF attacks
        });

        console.log('User authenticated, access and refresh tokens issued');
        return res.json({ accessToken, user });

    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'An error occurred during sign-in' });
    }
});

module.exports = router;
