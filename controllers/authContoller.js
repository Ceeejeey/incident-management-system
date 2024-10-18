const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/config').pool; 

const saltRounds = 10;

// Signup logic
router.post('/signup', async (req, res) => {
    const { name, email, role, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    // Validation before hashing
    if (!name || !email || !role || !password || !confirmPassword) {
        return res.send('All fields are required');
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.send('Invalid email format');
    }

    // Ensure role is either 'student' or 'staff'
    if (role !== 'student' && role !== 'staff') {
        return res.send('Invalid role');
    }

    try {
        // Hash the password
        const hash = await bcrypt.hash(password, saltRounds);

        // Insert user with hashed password into the database
        const sql = `INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)`;
        
        // Execute the query
        const [result] = await db.query(sql, [name, email, role, hash]);

        res.send('User registered successfully');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Error while signing up');
    }
});

// Sign-in logic
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        // Query the user by email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).send('Invalid email or password');
        }

        const user = rows[0];
        console.log(user);

        // Compare the password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // If password matches, the user is authenticated
        res.send(`Welcome ${user.name}, you have successfully signed in!`);

    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).send('An error occurred during sign-in');
    }
});

module.exports = router;
