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
        user: req.user ,// Pass user info to the dashboard
        role: req.user.role
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
        const [messages] = await pool.query(`
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
            
        // console.log('Messages:', messages);
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
    const staff_id = req.user.id;  // Assuming user authentication middleware sets req.user
    const student_id = req.params.student_id;

    console.log('staff_id:', req.user);
console.log('student_id:', student_id);

    try {

        // Fetch the student information
        const [student] = await pool.query('SELECT * FROM users WHERE user_id = ?', [student_id]);

        // Fetch previous messages between the staff and the student
        const [messages] = await pool.query(`
            SELECT 
                m.message AS content, 
                m.timestamp, 
                CASE 
                    WHEN m.sender_id = ? THEN 'outgoing' 
                    ELSE 'incoming' 
                END AS message_type,
                (SELECT name FROM users WHERE user_id = m.sender_id) AS sender_name
            FROM 
                messages m 
            WHERE 
                (m.sender_id = ? AND m.receiver_id = ?) OR 
                (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY 
                m.timestamp ASC;
        `, [staff_id, staff_id, student_id, student_id, staff_id]);
        
        console.log('Messages:', messages);
        // Mark unread messages as read
        await pool.query(`
            UPDATE messages
            SET isread = 1
            WHERE sender_id = ? AND receiver_id = ? AND isread = 0
        `, [student_id, staff_id]);

        
        // Render the chat_staff.ejs page and pass the messages and student info
        res.render('communication/chat_staff', {
            messages: messages, // Pass messages exchanged between the staff and student
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

// Add a route to render the review page
router.get('/admin/review-incidents', authenticateToken ,async (req, res) => {
    try {
        const [staffMembers] = await pool.query('SELECT user_id, name FROM users WHERE role = "staff"');
        const [incidentReports] = await pool.query(`
            SELECT incident_reports.*, users.name AS reporter_name
            FROM incident_reports 
            JOIN users ON incident_reports.reporter_id = users.user_id
            WHERE incident_reports.status = 'pending'
        `);
        
        console.log('Staff Members:', staffMembers);
        console.log('Incident Reports (In Progress):', incidentReports);
        res.render('incident/adminReviewReport', { incidentReports, staffMembers });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading the incident review page');
    }
    
});

// Route to assign an incident report
router.post('/assign-incident', authenticateToken, async (req, res) => {
    const { reportId, staffId, severity, adminDescription } = req.body;
    const dateNow = new Date();

    try {
        await pool.query(`
            INSERT INTO incidents (reported_by, title,user_description,category, description, evidence, location, status, assigned_to, date_reported, last_updated, severity)
            SELECT reporter_id, title ,description , category , ?, evidence, location, 'in-progress', ?, ?, ?, ?
            FROM incident_reports WHERE id = ?
        `, [adminDescription, staffId, dateNow, dateNow, severity, reportId]);

        await pool.query('UPDATE incident_reports SET status = "in-progress" WHERE id = ?', [reportId]);

        // Create a notification for the assigned staff
        const notificationMessage = `You have been assigned a new incident report (#${reportId}).`;
        const notificationLink = `/staff/incident-report/${reportId}`;

        await pool.query(`
            INSERT INTO notifications (staff_id, message, link) VALUES (?, ?, ?)
        `, [staffId, notificationMessage, notificationLink]);

        
        res.redirect('/admin/review-incidents?assigned=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error assigning the incident');
    }
});

//notification route for staff
router.get('/staff/notifications/unread', authenticateToken ,async (req, res) => {
    const staffId = req.user.id;

    const [notifications] = await pool.query(`
        SELECT * FROM notifications WHERE staff_id = ? AND is_read = FALSE ORDER BY timestamp DESC
    `, [staffId]);

    res.json(notifications);
});

// Route to mark a notification as read
router.post('/staff/notifications/mark-as-read/:id', authenticateToken ,async (req, res) => {
    const notificationId = req.params.id;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE notification_id = ?', [notificationId]);
    res.status(200).send();
});


// Route to update incident status
router.post('/staff/update-incident', authenticateToken, async (req, res) => {
    const { incidentId, updateDescription } = req.body;
    const timestamp = new Date();

    // Validate input
    if (!incidentId || !updateDescription) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Insert update log into incident_logs table
        await pool.query(`
            INSERT INTO incident_logs (incident_id, updated_by, new_status, update_description, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `, [incidentId, req.user.id, 'in-progress', updateDescription, timestamp]);

        // Send JSON response for successful update
        res.json({ success: true, message: 'Incident updated successfully' });
    } catch (error) {
        console.error("Error updating incident:", error);
        res.status(500).json({ success: false, message: 'Error updating the incident' });
    }
});

// Route to mark an incident as resolved
router.post('/staff/resolve-incident', authenticateToken, async (req, res) => {
    const { incidentId, resolveDescription } = req.body;
    const timestamp = new Date();

    console.log('Incident ID:', incidentId);
    console.log('Resolve Description:', resolveDescription);

    // Validate input
    if (!incidentId || !resolveDescription) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Fetch the current status from incident_logs
        const [rows] = await pool.query(`SELECT new_status FROM incident_logs WHERE incident_id = ? ORDER BY timestamp DESC LIMIT 1`, [incidentId]);
        const new_status = rows.length > 0 ? rows[0].new_status : null;

        // Update or insert log based on current status
        if (new_status === 'in-progress') {
            // Update the existing log entry
            await pool.query(`
                UPDATE incident_logs SET new_status = "resolved", update_description = ?, timestamp = ? 
                WHERE incident_id = ?
            `, [resolveDescription, timestamp, incidentId]);
        } else {
            // Insert a new log entry
            await pool.query(`
                INSERT INTO incident_logs (incident_id, updated_by, new_status, update_description, timestamp)
                VALUES (?, ?, ?, ?, ?)
            `, [incidentId, req.user.id, 'resolved', resolveDescription, timestamp]);
        }

        // Update the incidents and incident_reports tables
        await pool.query('UPDATE incidents SET status = "resolved", last_updated = NOW() WHERE incident_id = ?', [incidentId]);
        // await pool.query('UPDATE incident_reports SET status = "resolved" WHERE incident_id = ?', [incidentId]);

        // Send JSON response for successful resolution
        res.json({ success: true, message: 'Incident marked as resolved' });
    } catch (error) {
        console.error('Error marking incident as resolved:', error);
        res.status(500).json({ success: false, message: 'Error marking incident as resolved' });
    }
});



// Route to get incident reports assigned to the logged-in staff member
router.get('/staff/assigned-incidents', authenticateToken ,async (req, res) => {
    const staffId = req.user.id; // Assumes `req.user.id` is the logged-in staff member's ID

    try {
        // Fetch incident reports assigned to this staff member
        const [incidentReports] = await pool.query(`
            SELECT 
                i.incident_id, 
                i.reported_by, 
                i.title,
                i.user_description,
                i.category,
                i.description, 
                i.evidence, 
                i.location, 
                i.status, 
                i.date_reported, 
                i.last_updated, 
                i.severity, 
                u.name AS reporter_name
            FROM 
                incidents i
            JOIN 
                users u ON i.reported_by = u.user_id
            WHERE 
                i.assigned_to = ? AND 
                i.status = 'in-progress'  -- Add this condition
            ORDER BY 
                i.last_updated DESC
        `, [staffId]);
        
        console.log('Incident reports:', incidentReports);
        res.render('incident/staffIncidentReport', { incidentReports });
    } catch (error) {
        console.error("Error fetching assigned incidents:", error);
        res.status(500).send('Error loading the assigned incidents page');
    }
});

// Assuming Express and MySQL are set up
router.get('/student/incidents', authenticateToken , async (req, res) => {
    const studentId = req.user.id; // Assuming student ID is available on req.user
    try {
      const [incidents] = await pool.query(
        'SELECT * FROM incidents WHERE reported_by = ? ORDER BY date_reported DESC',
        [studentId]
      );
      console.log('Incidents:', incidents);
      res.render('incident/studentIncidentTracking', { incidents });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving incident reports');
    }
  });
  
  // Route to render the user management page
router.get('/user-management', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT user_id, name, email, role FROM users');
        res.render('userManagement/adminUserManagement', { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error loading user management page");
    }
});


//signout route
router.get('/signout', (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/signin');
});


module.exports = router;