const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/report-incident', authenticateToken, upload.array('evidence[]'), async (req, res) => {
  const reporterId = req.user.id;
  const { title, description, date, category, latitude, longitude } = req.body;
  const evidencePaths = req.files.map((file) => file.path);

  try {
    await pool.query(
      `INSERT INTO incident_reports (title, description, date, category, evidence, reporter_id, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, category, JSON.stringify(evidencePaths), reporterId, latitude, longitude]
    );
    res.status(200).json({ message: 'Incident reported successfully.' });
  } catch (error) {
    console.error('Error reporting the incident:', error);
    res.status(500).json({ error: 'Error reporting the incident' });
  }
});

router.get('/incident-reports', authenticateToken, async (req, res) => {
  try {
    const [incidentReports] = await pool.query(`
      SELECT incident_reports.*, users.name
      FROM incident_reports
      JOIN users ON incident_reports.reporter_id = users.user_id
    `);
    res.status(200).json({ incidentReports });
  } catch (error) {
    console.error('Error retrieving incident reports:', error);
    res.status(500).json({ error: 'Error retrieving incident reports' });
  }
});

router.get('/incidents/pending', authenticateToken, async (req, res) => {
  try {
    const [staffMembers] = await pool.query(
      'SELECT user_id, name FROM users WHERE role = "staff"'
    );
    const [incidentReports] = await pool.query(`
      SELECT incident_reports.*, users.name AS reporter_name
      FROM incident_reports
      JOIN users ON incident_reports.reporter_id = users.user_id
      WHERE incident_reports.status = 'pending'
    `);
    res.json({ incidentReports, staffMembers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading incidents' });
  }
});

router.get('/incidents/assigned', authenticateToken, async (req, res) => {
  const staffId = req.user.id;

  try {
    const [incidentReports] = await pool.query(
      `SELECT i.incident_id, i.reported_by, i.title, i.user_description, i.category,
              i.description, i.evidence, i.status, i.date_reported, i.last_updated,
              i.severity, i.latitude, i.longitude, u.name AS reporter_name
       FROM incidents i
       JOIN users u ON i.reported_by = u.user_id
       WHERE i.assigned_to = ? AND i.status = 'in-progress'
       ORDER BY i.last_updated DESC`,
      [staffId]
    );
    res.json({ incidentReports });
  } catch (error) {
    console.error('Error fetching assigned incidents:', error);
    res.status(500).json({ message: 'Error loading assigned incidents' });
  }
});

router.get('/incidents/assigned/resolved', authenticateToken, async (req, res) => {
  const staffId = req.user.id;

  try {
    const [incidentReports] = await pool.query(
      `SELECT i.incident_id, i.reported_by, i.title, i.user_description, i.category,
              i.description, i.evidence, i.status, i.date_reported, i.last_updated,
              i.severity, i.latitude, i.longitude, u.name AS reporter_name
       FROM incidents i
       JOIN users u ON i.reported_by = u.user_id
       WHERE i.assigned_to = ? AND i.status = 'resolved'
       ORDER BY i.last_updated DESC`,
      [staffId]
    );
    res.json({ incidentReports });
  } catch (error) {
    console.error('Error fetching resolved incidents:', error);
    res.status(500).json({ message: 'Error loading resolved incidents' });
  }
});

router.get('/incidents/student', authenticateToken, async (req, res) => {
  const studentId = req.user.id;

  try {
    const [incidents] = await pool.query(
      'SELECT * FROM incident_reports WHERE reporter_id = ? ORDER BY date DESC',
      [studentId]
    );
    res.json({ incidents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving incidents' });
  }
});

router.get('/incidents/reporter', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [incidents] = await pool.query(
      'SELECT * FROM incident_reports WHERE reporter_id = ? ORDER BY date DESC',
      [userId]
    );
    res.json({ incidents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving incidents' });
  }
});

router.get('/incidents/all', authenticateToken, async (req, res) => {
  try {
    const [incidents] = await pool.query(`
      SELECT incidents.incident_id, incidents.title, incidents.user_description,
             incidents.category, incidents.description, incidents.evidence,
             incidents.status, incidents.severity, incidents.latitude, incidents.longitude,
             DATE_FORMAT(incidents.date_reported, '%Y-%m-%d') AS date_reported,
             DATE_FORMAT(incidents.last_updated, '%Y-%m-%d') AS last_updated,
             COALESCE(staff.name, 'Not Yet') AS assigned_staff_name,
             student.name AS reported_by
      FROM incidents
      LEFT JOIN users AS staff ON incidents.assigned_to = staff.user_id AND staff.role = 'staff'
      JOIN users AS student ON incidents.reported_by = student.user_id AND student.role = 'student'
    `);
    res.json({ incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ message: 'Error loading incidents' });
  }
});

router.post('/incidents/assign', authenticateToken, async (req, res) => {
  const { reportId, latitude, longitude, staffId, severity, adminDescription } = req.body;
  const dateNow = new Date();

  try {
    const [result] = await pool.query(
      `INSERT INTO incidents (reported_by, title, user_description, category, description, evidence, status, assigned_to, date_reported, last_updated, severity, latitude, longitude)
       SELECT reporter_id, title, description, category, ?, evidence, 'in-progress', ?, ?, ?, ?, ?, ?
       FROM incident_reports WHERE id = ?`,
      [adminDescription, staffId, dateNow, dateNow, severity, latitude, longitude, reportId]
    );

    const incidentId = result.insertId;

    await pool.query('UPDATE incident_reports SET status = "in-progress" WHERE id = ?', [reportId]);

    const notificationMessage = `You have been assigned a new incident report (#${incidentId}).`;
    const notificationLink = `/staff/incident-report/${incidentId}`;
    await pool.query(
      'INSERT INTO notifications (staff_id, message, link) VALUES (?, ?, ?)',
      [staffId, notificationMessage, notificationLink]
    );

    const [[reportData]] = await pool.query(
      `SELECT ir.reporter_id, ir.title, u.name AS staff_name
       FROM incident_reports AS ir
       JOIN users AS u ON u.user_id = ? AND u.role = 'staff'
       WHERE ir.id = ?`,
      [staffId, reportId]
    );

    if (reportData) {
      const studentNotificationMessage = `Your incident report, "${reportData.title}," has been assigned to staff member ${reportData.staff_name}.`;
      const studentNotificationLink = `/student/incidents`;
      await pool.query(
        'INSERT INTO student_notifications (student_id, incident_id, message, link) VALUES (?, ?, ?, ?)',
        [reportData.reporter_id, incidentId, studentNotificationMessage, studentNotificationLink]
      );
    }

    res.json({ success: true, message: 'Incident assigned successfully', incidentId });
  } catch (error) {
    console.error('Error assigning the incident:', error);
    res.status(500).json({ success: false, message: 'Error assigning the incident' });
  }
});

router.post('/incidents/update', authenticateToken, async (req, res) => {
  const { incidentId, updateDescription } = req.body;

  if (!incidentId || !updateDescription) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    await pool.query(
      'INSERT INTO incident_logs (incident_id, updated_by, new_status, update_description, timestamp) VALUES (?, ?, ?, ?, ?)',
      [incidentId, req.user.id, 'in-progress', updateDescription, new Date()]
    );
    res.json({ success: true, message: 'Incident updated successfully' });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ success: false, message: 'Error updating the incident' });
  }
});

router.post('/incidents/resolve', authenticateToken, async (req, res) => {
  const { incidentId, resolveDescription } = req.body;
  const timestamp = new Date();

  if (!incidentId || !resolveDescription) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT new_status FROM incident_logs WHERE incident_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [incidentId]
    );
    const currentStatus = rows.length > 0 ? rows[0].new_status : null;

    if (currentStatus === 'in-progress') {
      await pool.query(
        'UPDATE incident_logs SET new_status = "resolved", update_description = ?, timestamp = ? WHERE incident_id = ?',
        [resolveDescription, timestamp, incidentId]
      );
    } else {
      await pool.query(
        'INSERT INTO incident_logs (incident_id, updated_by, new_status, update_description, timestamp) VALUES (?, ?, ?, ?, ?)',
        [incidentId, req.user.id, 'resolved', resolveDescription, timestamp]
      );
    }

    await pool.query(
      'UPDATE incidents SET status = "resolved", last_updated = NOW() WHERE incident_id = ?',
      [incidentId]
    );

    await pool.query(
      `UPDATE incident_reports SET status = "resolved"
       WHERE reporter_id = (SELECT reported_by FROM incidents WHERE incident_id = ?)`,
      [incidentId]
    );

    res.json({ success: true, message: 'Incident marked as resolved' });
  } catch (error) {
    console.error('Error marking incident as resolved:', error);
    res.status(500).json({ success: false, message: 'Error marking incident as resolved' });
  }
});

router.get('/incidents/resolved/daily', authenticateToken, async (req, res) => {
  try {
    const [incidents] = await pool.query(
      `SELECT date, COUNT(*) AS count
       FROM incident_reports
       WHERE status = "resolved"
       GROUP BY date
       ORDER BY date DESC`
    );
    res.status(200).json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving resolved incidents' });
  }
});

module.exports = router;
