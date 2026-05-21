const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, name, email, role FROM users'
    );
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error loading users' });
  }
});

router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const [staff] = await pool.query(
      'SELECT user_id, name FROM users WHERE role = "staff"'
    );
    res.json({ staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error loading staff' });
  }
});

module.exports = router;
