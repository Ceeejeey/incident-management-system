const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/feedback/user-incidents', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [incidents] = await pool.query(
      'SELECT incident_id, title FROM incidents WHERE reported_by = ?',
      [userId]
    );
    res.json({ incidents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

router.post('/feedback', authenticateToken, async (req, res) => {
  const { incident_id, rating, comments } = req.body;
  const userId = req.user.id;

  if (!incident_id || !rating) {
    return res.status(400).json({ message: 'incident_id and rating are required' });
  }

  try {
    await pool.query(
      'INSERT INTO feedback (incident_id, user_id, rating, comments) VALUES (?, ?, ?, ?)',
      [incident_id, userId, rating, comments]
    );
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

router.get('/feedback/all', authenticateToken, async (req, res) => {
  try {
    const [feedbacks] = await pool.query(
      `SELECT feedback.feedback_id, feedback.incident_id, feedback.user_id,
              feedback.rating, feedback.comments, feedback.submitted_at,
              users.name AS user_name, incidents.description AS incident_description
       FROM feedback
       JOIN users ON feedback.user_id = users.user_id
       JOIN incidents ON feedback.incident_id = incidents.incident_id
       ORDER BY feedback.submitted_at DESC`
    );
    res.json({ feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while retrieving feedback' });
  }
});

module.exports = router;
