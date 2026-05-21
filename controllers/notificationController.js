const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/notifications/student', authenticateToken, async (req, res) => {
  const studentId = req.user.id;

  try {
    const [notifications] = await pool.query(
      `SELECT sn.*, i.incident_id, i.title AS incident_title, u.name AS staff_name
       FROM student_notifications sn
       JOIN incidents i ON sn.incident_id = i.incident_id
       JOIN users u ON i.assigned_to = u.user_id
       WHERE sn.student_id = ?
       ORDER BY sn.created_at DESC`,
      [studentId]
    );

    await pool.query(
      'UPDATE student_notifications SET is_read = TRUE WHERE student_id = ?',
      [studentId]
    );

    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
});

router.get('/notifications/staff', authenticateToken, async (req, res) => {
  const staffId = req.user.id;

  try {
    const [notifications] = await pool.query(
      `SELECT n.notification_id, n.message, n.link, n.is_read, n.timestamp
       FROM notifications n
       WHERE n.staff_id = ?
       ORDER BY n.timestamp DESC`,
      [staffId]
    );

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE staff_id = ?',
      [staffId]
    );

    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
});

router.get('/notifications/student/count', authenticateToken, async (req, res) => {
  const studentId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM student_notifications WHERE student_id = ? AND is_read = 0',
      [studentId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ count: 0 });
  }
});

router.get('/notifications/staff/count', authenticateToken, async (req, res) => {
  const staffId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE staff_id = ? AND is_read = 0',
      [staffId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ count: 0 });
  }
});

module.exports = router;
