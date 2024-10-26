const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/config'); // Assume you have a database connection file

const router = express.Router();

console.log('Incident Controller');
// Configure file upload with multer
const storage = multer.diskStorage({
    destination: 'uploads/', // Save files in the "uploads" folder
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
const upload = multer({ storage });

// Route for incident report submission
router.post('/report-incident', upload.array('evidence[]'), async (req, res) => {
    console.log('data:', req.body);
    console.log('files:', req.files);
    const { title, description, date, location, category } = req.body;
    const evidencePaths = req.files.map(file => file.path);

    try {
        // Insert incident data into the database
        await pool.query('INSERT INTO incident_reports (title, description, date, location, category, evidence) VALUES (?, ?, ?, ?, ?, ?)', 
            [title, description, date, location, category, JSON.stringify(evidencePaths)]
        );
        res.status(200).json({ message: 'Incident reported successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error reporting the incident' });
    }
});

module.exports = router;
