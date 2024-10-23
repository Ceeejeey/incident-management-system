const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

// Basic Route to Test Server
router.get('/', (req, res) => {
    res.render('index');
});

// Sign-in and Sign-up routes
router.get('/signin', (req, res) => {
    res.render('signin');
})

router.get('/signup', async (req, res) => {
    try {
        // Check if an admin already exists
        const [adminCheck] = await pool.query('SELECT COUNT(*) AS adminCount FROM users WHERE role = "admin"');
        const adminExists = adminCheck[0].adminCount > 0; // true if admin exists

        // Render the signup page and pass adminExists variable
        res.render('signup', { adminExists });
    } catch (error) {
        console.error('Error checking for admin:', error);
        res.status(500).send('Error loading signup page');
    }
});

//staff Dashboard route
router.get('/dashboards/staff_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.role);
    res.render('dashboards/staff_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});

//admin Dashboard route
router.get('/dashboards/admin_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.role);
    res.render('dashboards/admin_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});

//student Dashboard route
router.get('/dashboards/student_dashboard', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.email);
    res.render('dashboards/student_dashboard', {
        user: req.user // Pass user info to the dashboard
    });
});

//incident Report route
router.get('/incident/incidentReport', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    console.log(req.user.email);
    res.render('incident/incidentReport', {
        user: req.user // Pass user info to the dashboard
    });
});
//emergency Contacts route
router.get('/emergencyContacts/emergency_contacts', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    try {
        // Query to fetch all staff members from the database
        const [staffContacts] = await pool.query('SELECT user_id,name FROM users WHERE role = "staff"');

        // Render the emergency contacts view, passing staff data
        console.log(staffContacts);
        res.render('emergencyContacts/emergency_contacts', {
            user: req.user, // Pass user info to the dashboard
            staffContacts: staffContacts // Pass staff members data to the EJS view
        });
    } catch (error) {
        console.error('Error fetching staff contacts:', error);
        res.status(500).send('Error loading emergency contacts page');
    }
});


//chat page route
// Chat page route
router.get('/communication/chat_student', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    const studentId = req.user.user_id; // Get the current student's user ID
    const staffId = req.query.user_id; // Get the selected staff ID from the query parameter

    try {
        // Fetch the staff details from the database based on the staffId
        const [staff] = await pool.query('SELECT user_id, name, email FROM users WHERE user_id = ?', [staffId]);

        if (staff.length === 0) {
            return res.status(404).send('Staff member not found');
        }

        // Fetch messages exchanged between the student and the selected staff member
        const messages = await pool.query(`
                            SELECT 
                    m.message AS content, 
                    m.timestamp, 
                    CASE 
                        WHEN m.sender_id = ? THEN 'outgoing' 
                        ELSE 'incoming' 
                    END AS message_type,  -- Renaming for clarity
                    (SELECT name FROM users WHERE user_id = m.sender_id) AS sender_name
                FROM 
                    messages m 
                WHERE 
                    (m.sender_id = ? AND m.receiver_id = ?) OR 
                    (m.sender_id = ? AND m.receiver_id = ?)
                ORDER BY 
                    m.timestamp ASC;

        `, [studentId, studentId, staffId, staffId, studentId]);

        // Render the chat page with messages, student and staff information
        res.render('communication/chat_student', {
            user: req.user, // Student info
            staff: staff[0], // Pass staff info to the template
            messages: messages // Pass messages to the template
        });
    } catch (error) {
        console.error('Error loading chat page:', error);
        res.status(500).send('Error loading chat page');
    }
});


//chat for staff
router.get('/communication/chat_staff', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    const staffId = req.user.user_id; 

    try {
        
        const [unreadMessages] = await pool.query(
            `SELECT m.*, u.name AS student_name 
             FROM messages m 
             JOIN users u ON m.sender_id = u.user_id 
             WHERE m.receiver_id = ? AND m.isread = 0`, // Ensure 'is_read' is correct
            [staffId]
        );

        
        const [previousMessages] = await pool.query(
            `SELECT m.*, u.name AS sender_name 
             FROM messages m 
             JOIN users u ON m.sender_id = u.user_id 
             WHERE (m.receiver_id = ? OR m.sender_id = ?)
             ORDER BY m.timestamp ASC`, 
            [staffId, staffId]
        );

        // If there are unread messages, get the first message's student details
        const studentId = unreadMessages.length > 0 ? unreadMessages[0].sender_id : null; // If no unread messages
        let student = null;

        if (studentId) {
            const [studentData] = await pool.query('SELECT user_id, name, email FROM users WHERE user_id = ?', [studentId]);
            if (studentData.length === 0) {
                return res.status(404).send('Student not found');
            }
            student = studentData[0]; // Assign the student data
        }

        // Render the chat page with staff and student information
        res.render('communication/chat_staff', {
            user: req.user,         // Staff info
            student: student,       // Student info (if found)
            unreadMessages,         // Pass unread messages to the template
            previousMessages        // Pass previous messages to the template
        });
    } catch (error) {
        console.error('Error loading chat page:', error);
        res.status(500).send('Error loading chat page');
    }
});



//signout route
router.get('/signout', (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/signin');
});


module.exports = router;