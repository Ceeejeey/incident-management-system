const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/config'); // Database connection file
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure file upload with multer
const storage = multer.diskStorage({
    destination: 'uploads/', // Save files in the "uploads" folder
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
const upload = multer({ storage });

// Route for incident report submission
router.post('/report-incident', upload.array('evidence[]'), authenticateToken, async (req, res) => {
    const reporterId = req.user.id;
    const { title, description, date, category, latitude, longitude } = req.body;
    const evidencePaths = req.files.map(file => file.path);

    try {
        // Insert incident data into the database, including latitude and longitude
        await pool.query(
            `INSERT INTO incident_reports 
            (title, description, date, category, evidence, reporter_id, latitude, longitude) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, date, category, JSON.stringify(evidencePaths), reporterId, latitude, longitude]
        );
        res.status(200).json({ message: 'Incident reported successfully.' });
    } catch (error) {
        console.error('Error reporting the incident:', error);
        res.status(500).json({ error: 'Error reporting the incident' });
    }
});

// Route to retrieve all incident reports
router.get('/incident-reports', authenticateToken, async (req, res) => {
    try {
        // Retrieve all incident reports from the database
        const [incidentReports] = await pool.query(`
            SELECT incident_reports.*, users.name 
            FROM incident_reports 
            JOIN users ON incident_reports.reporter_id = users.user_id
        `);

        // Send the incident reports data as a JSON response
        res.status(200).json({ incidentReports });
    } catch (error) {
        console.error('Error retrieving incident reports:', error);
        res.status(500).json({ error: 'Error retrieving incident reports' });
    }
});

module.exports = router;
