const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/chat/messages', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.query;

  if (!otherUserId) {
    return res.status(400).json({ message: 'otherUserId query parameter is required' });
  }

  try {
    const [otherUser] = await pool.query(
      'SELECT user_id, name, email FROM users WHERE user_id = ?',
      [otherUserId]
    );

    if (otherUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [messages] = await pool.query(
      `SELECT m.message AS content, m.timestamp,
              CASE WHEN m.sender_id = ? THEN 'outgoing' ELSE 'incoming' END AS message_type,
              (SELECT name FROM users WHERE user_id = m.sender_id) AS sender_name
       FROM messages m
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.timestamp ASC`,
      [userId, userId, otherUserId, otherUserId, userId]
    );

    await pool.query(
      'UPDATE messages SET isread = 1 WHERE sender_id = ? AND receiver_id = ? AND isread = 0',
      [otherUserId, userId]
    );

    res.json({ messages, otherUser: otherUser[0] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error loading messages' });
  }
});

router.get('/chat/unread/:staffId', authenticateToken, async (req, res) => {
  const staffId = req.params.staffId;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM messages WHERE isread = 0 AND receiver_id = ?',
      [staffId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).json({ message: 'Error fetching unread messages' });
  }
});

router.get('/chat/students-with-unread', authenticateToken, async (req, res) => {
  const staffId = req.user.id;

  try {
    const [students] = await pool.query(
      `SELECT users.user_id AS student_id, users.name, COUNT(messages.message_id) AS unread_count
       FROM messages
       JOIN users ON messages.sender_id = users.user_id
       WHERE messages.receiver_id = ? AND messages.isread = 0
       GROUP BY users.user_id, users.name`,
      [staffId]
    );
    res.json({ studentsWithUnreadMessages: students });
  } catch (error) {
    console.error('Error fetching students with unread messages:', error);
    res.status(500).json({ message: 'Error loading communications' });
  }
});

module.exports = router;
