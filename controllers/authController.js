const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/config');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/signup', async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
      [name, email, role, hashedPassword]
    );
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Error during signup:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error while signing up' });
  }
});

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

    const existingRefreshToken = req.cookies.refreshToken;
    if (existingRefreshToken) {
      try {
        jwt.verify(existingRefreshToken, process.env.JWT_REFRESH_SECRET);
        return res.json({ user: { id: user.user_id, name: user.name, email: user.email, role: user.role } });
      } catch (err) {
        // expired or invalid, continue to issue new one
      }
    }

    const payload = { id: user.user_id, email: user.email, name: user.name, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ accessToken, user: { id: user.user_id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).json({ message: 'An error occurred during sign-in' });
  }
});

router.get('/check-admin', async (req, res) => {
  try {
    const [adminCheck] = await pool.query(
      'SELECT COUNT(*) AS adminCount FROM users WHERE role = "admin"'
    );
    res.json({ adminExists: adminCheck[0].adminCount > 0 });
  } catch (error) {
    console.error('Error checking for admin:', error);
    res.status(500).json({ message: 'Error checking admin status' });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const [results] = await pool.query('SELECT password FROM users WHERE user_id = ?', [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, results[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedNewPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

router.post('/signout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Signed out successfully' });
});

module.exports = router;
