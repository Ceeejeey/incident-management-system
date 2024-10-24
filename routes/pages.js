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

// Chat page route
router.get('/communication/chat_student', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }
    console.log("fucking ser: " + req.user);
    const studentId = req.user.id; // Get the current student's user ID
    const staffId = req.query.user_id; // Get the selected staff ID from the query parameter

    console.log('Student ID:', studentId);
    console.log('Staff ID:', staffId);

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
// Route to render the chat_staff.ejs page for a specific student
router.get('/communication/chat_staff/:student_id', authenticateToken, async (req, res) => {
    const staff_id = req.user.user_id;  // Assuming user authentication middleware sets req.user
    const student_id = req.params.student_id;

    try {
        // Fetch previous messages between the staff and the student
        const [previousMessages] = await pool.query(`
            SELECT messages.*, users.name as sender_name
            FROM messages
            JOIN users ON messages.sender_id = users.user_id
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        `, [staff_id, student_id, student_id, staff_id]);

        // Fetch unread messages for the staff member from this student
        const [unreadMessages] = await pool.query(`
            SELECT messages.*, users.name as sender_name
            FROM messages
            JOIN users ON messages.sender_id = users.user_id
            WHERE sender_id = ? AND receiver_id = ? AND isread = 0
            ORDER BY timestamp ASC
        `, [student_id, staff_id]);

        // Mark unread messages as read
        await pool.query(`
            UPDATE messages
            SET isread = 1
            WHERE sender_id = ? AND receiver_id = ? AND isread = 0
        `, [student_id, staff_id]);

        // Fetch the student information
        const [student] = await pool.query('SELECT * FROM users WHERE user_id = ?', [student_id]);

        // Render the chat_staff.ejs page and pass the messages and student info
        res.render('communication/chat_staff', {
            previousMessages,
            unreadMessages,
            student: student[0], // Pass student details
            user: req.user  // Pass the logged-in staff details
        });
    } catch (error) {
        console.error('Error loading chat:', error);
        res.status(500).send('Server Error');
    }
});

// Route to render the staff communication page
router.get('/communication/staff_communication', authenticateToken, async (req, res) => {
    const staff_id = req.user.id;  // Assuming user authentication middleware sets req.user
    
    try {
        // Query to get students who have sent unread messages to the staff
        const [studentsWithUnreadMessages] = await pool.query(`
            SELECT users.user_id as student_id, users.name, COUNT(messages.message_id) as unread_count
            FROM messages
            JOIN users ON messages.sender_id = users.user_id
            WHERE messages.receiver_id = ? AND messages.isread = 0
            GROUP BY users.user_id, users.name
        `, [staff_id]);

        // Render the staff communication page and pass the list of students with unread messages
        res.render('communication/staff_communication', { studentsWithUnreadMessages, user: req.user });

    } catch (error) {
        console.error('Error fetching students with unread messages:', error);
        res.status(500).send('Server Error');
    }
});

// Route to fetch unread messages for a staff member
router.get('/unread/:staffId', authenticateToken, async (req, res) => {
    const staffId = req.params.staffId;
    console.log('Fetching unread messages for staff ID:', staffId);

    try {
        const [rows] = await pool.query(
            'SELECT * FROM messages WHERE isread = 0 AND receiver_id = ?',
            [staffId]
        );
        console.log('Unread messages:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        res.status(500).json({ message: 'An error occurred while fetching unread messages' });
    }
});

//signout route
router.get('/signout', (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/signin');
});


module.exports = router;