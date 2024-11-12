const express = require('express');
const router = express.Router();
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');
const bcrypt = require('bcryptjs');




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
        user: req.user,// Pass user info to the dashboard
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
router.get('/admin/review-incidents', authenticateToken, async (req, res) => {
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
    const { reportId, latitude, longitude, staffId, severity, adminDescription } = req.body;
    const dateNow = new Date();

    try {console.log('body',req.body);
        // Insert the incident and get the inserted incident_id
        const [result] = await pool.query(`
            INSERT INTO incidents (reported_by, title, user_description, category, description, evidence, status, assigned_to, date_reported, last_updated, severity, latitude, longitude)
            SELECT reporter_id, title, description, category, ?, evidence, 'in-progress', ?, ?, ?, ?, ?, ?
            FROM incident_reports WHERE id = ?
        `, [adminDescription, staffId, dateNow, dateNow, severity, latitude, longitude, reportId]);

        const incidentId = result.insertId; // Get the newly inserted incident ID

        // Update the status in the incident_reports table
        await pool.query('UPDATE incident_reports SET status = "in-progress" WHERE id = ?', [reportId]);

        // Notification for assigned staff member
        const notificationMessage = `You have been assigned a new incident report (#${incidentId}).`;
        const notificationLink = `/staff/incident-report/${incidentId}`;
        await pool.query(`
            INSERT INTO notifications (staff_id, message, link) VALUES (?, ?, ?)
        `, [staffId, notificationMessage, notificationLink]);

        // Retrieve reporter information, incident title, and staff name for the student notification
        const [[reportData]] = await pool.query(`
            SELECT ir.reporter_id, ir.title, u.name AS staff_name
            FROM incident_reports AS ir
            JOIN users AS u ON u.user_id = ? AND u.role = 'staff'
            WHERE ir.id = ?
        `, [staffId, reportId]);

        if (!reportData) {
            throw new Error('Incident report not found');
        }

        // Notification message for the student
        const studentNotificationMessage = `Your incident report, "${reportData.title}," has been assigned to staff member ${reportData.staff_name}.`;
        const studentNotificationLink = `/student/incidents`;
        await pool.query(`
            INSERT INTO student_notifications (student_id, incident_id, message, link) VALUES (?, ?, ?, ?)
        `, [reportData.reporter_id, incidentId, studentNotificationMessage, studentNotificationLink]);

        // Redirect with a success query parameter
        res.redirect('/admin/review-incidents?assigned=true');
    } catch (error) {
        console.error('Error assigning the incident:', error);
        res.status(500).send('Error assigning the incident');
    }
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
        const [rows] = await pool.query(
            `SELECT new_status FROM incident_logs WHERE incident_id = ? ORDER BY timestamp DESC LIMIT 1`,
            [incidentId]
        );
        const new_status = rows.length > 0 ? rows[0].new_status : null;

        // Update or insert log based on current status
        if (new_status === 'in-progress') {
            // Update the existing log entry
            await pool.query(
                `UPDATE incident_logs SET new_status = "resolved", update_description = ?, timestamp = ? 
                WHERE incident_id = ?`,
                [resolveDescription, timestamp, incidentId]
            );
        } else {
            // Insert a new log entry
            await pool.query(
                `INSERT INTO incident_logs (incident_id, updated_by, new_status, update_description, timestamp)
                VALUES (?, ?, ?, ?, ?)`,
                [incidentId, req.user.id, 'resolved', resolveDescription, timestamp]
            );
        }

        // Update the incidents table's status
        await pool.query(
            'UPDATE incidents SET status = "resolved", last_updated = NOW() WHERE incident_id = ?',
            [incidentId]
        );

        // Update incident_reports using the reporter_id from the incidents table
        await pool.query(
            `UPDATE incident_reports SET status = "resolved" 
             WHERE reporter_id = (SELECT reported_by FROM incidents WHERE incident_id = ?)`,
            [incidentId]
        );

        // Send JSON response for successful resolution
        res.json({ success: true, message: 'Incident marked as resolved' });
    } catch (error) {
        console.error('Error marking incident as resolved:', error);
        res.status(500).json({ success: false, message: 'Error marking incident as resolved' });
    }
});



// Route to get incident reports assigned to the logged-in staff member
router.get('/staff/assigned-incidents', authenticateToken, async (req, res) => {
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
                i.status, 
                i.date_reported, 
                i.last_updated, 
                i.severity,
                i.latitude,
                i.longitude,
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

//student incident tracking route
router.get('/student/incidents', authenticateToken, async (req, res) => {
    const studentId = req.user.id; // Assuming student ID is available on req.user
    try {
        // Fetch incidents reported by the student
        const [incidents] = await pool.query(
            'SELECT * FROM incident_reports WHERE reporter_id = ? ORDER BY date DESC',
            [studentId]
        );

        // Log the results for debugging
        console.log('Incidents:', incidents);


        // Render the view with both incidents and their statuses
        res.render('incident/studentIncidentTracking', { incidents });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving incident reports');
    }
});

router.get('/staff/incidents', authenticateToken, async (req, res) => {
    const staffId = req.user.id; // Assuming student ID is available on req.user
    try {
        // Fetch incidents reported by the student
        const [incidents] = await pool.query(
            'SELECT * FROM incident_reports WHERE reporter_id = ? ORDER BY date DESC',
            [staffId]
        );

        // Log the results for debugging
        console.log('Incidents:', incidents);


        // Render the view with both incidents and their statuses
        res.render('incident/staffIncidentTracking', { incidents });
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

// Route to render the incident tracking page for admins
router.get('/admin/trackIncidents', authenticateToken, async (req, res) => {
    try {
        const [incidents] = await pool.query(`SELECT 
    incidents.incident_id,
    incidents.title,
    incidents.user_description,
    incidents.category,
    incidents.description,
    incidents.evidence,
    incidents.status,
    incidents.severity,
    incidents.latitude,
    incidents.longitude,
    DATE_FORMAT(incidents.date_reported, '%Y-%m-%d') AS date_reported,
    DATE_FORMAT(incidents.last_updated, '%Y-%m-%d') AS last_updated,
    COALESCE(staff.name, 'Not Yet') AS assigned_staff_name,
    student.name AS reported_by
FROM 
    incidents
LEFT JOIN 
    users AS staff ON incidents.assigned_to = staff.user_id AND staff.role = 'staff'
JOIN 
    users AS student ON incidents.reported_by = student.user_id AND student.role = 'student';
`);
        res.render('incident/adminTrackIncidents', { incidents });
        console.log('Incidents:', incidents);
    } catch (error) {
        console.error("Error fetching incidents:", error);
        res.status(500).send("Error loading incident tracking page");
    }
});

//notification route for student
router.get('/student/notifications', authenticateToken, async (req, res) => {
    const studentId = req.user.id;

    try {
        const [notifications] = await pool.query(
            `
            SELECT 
                sn.*, 
                i.incident_id, 
                i.title AS incident_title, 
                u.name AS staff_name
            FROM 
                student_notifications sn
            JOIN 
                incidents i ON sn.incident_id = i.incident_id
            JOIN 
                users u ON i.assigned_to = u.user_id
            WHERE 
                sn.student_id = ?
            ORDER BY 
                sn.created_at DESC
            `,
            [studentId]
        );

        await pool.query(
            'UPDATE student_notifications SET is_read = TRUE WHERE student_id = ?',
            [studentId]
        );
        console.log('Notifications:', notifications);
        res.render('notifications/student_notifications', { notifications });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving notifications');
    }
});

//notification route for student
router.get('/staff/notifications', authenticateToken, async (req, res) => {
    const staffId = req.user.id;

    try {
        const [notifications] = await pool.query(
            `
            SELECT 
                n.notification_id, 
                n.message, 
                n.link, 
                n.is_read, 
                n.timestamp 
            FROM 
                notifications n
            WHERE 
                n.staff_id = ?
            ORDER BY 
                n.timestamp DESC
            `,
            [staffId]
        );
    
        // Mark all notifications as read for the staff
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE staff_id = ?',
            [staffId]
        );
    
        console.log('Notifications:', notifications);
        res.render('notifications/staff_notification', { notifications });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving notifications');
    }
    
});

router.get('/student/notifications/count', authenticateToken, async (req, res) => {
    const studentId = req.user.id;

    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS count FROM student_notifications WHERE student_id = ? AND is_read = 0`, // Assuming 'is_read' indicates whether it's read
            [studentId]
        );

        res.json({ count: rows[0].count });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        res.status(500).json({ count: 0 });
    }
});

router.get('/staff/notifications/count', authenticateToken, async (req, res) => {
    const staffId = req.user.id;

    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS count FROM notifications WHERE staff_id = ? AND is_read = 0`,
            [staffId]
        );

        res.json({ count: rows[0].count });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        res.status(500).json({ count: 0 });
    }
});
// Route to render the Change Password page
router.get('/change-password', authenticateToken ,async (req, res) => {
    const userType = req.user.role; 
    let dashboardUrl = '/dashboard';
    if (userType === 'admin') {
        dashboardUrl = '/dashboards/admin_dashboard';
    } else if (userType === 'staff') {
        dashboardUrl = '/dashboards/staff_dashboard';
    } else if (userType === 'student') {
        dashboardUrl = '/dashboards/student_dashboard';
    }

    console.log(dashboardUrl);
    res.render('userManagement/changePassword', {
        message: '',          // Initial empty message
        messageType: '',      // Initial empty messageType
        userType: userType,    // Pass the user type
        dashboardUrl: dashboardUrl
    });
});

// Route to handle the password change request
router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword, userType } = req.body;
    
    if (newPassword !== confirmPassword) {
        return res.render('userManagement/changePassword', {
            message: 'Passwords do not match.',
            messageType: 'error',
            userType: userType
        });
    }

    const userId = req.user.id;  // Assuming the user ID is available from the token/session

    try {
        // Query to get the current user's password
        const [results] = await pool.query('SELECT password FROM users WHERE user_id = ?', [userId]);

        if (results.length === 0) {
            return res.render('userManagement/changePassword', {
                message: 'User not found.',
                messageType: 'error',
                userType: userType
            });
        }

        const user = results[0];

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.render('userManagement/changePassword', {
                message: 'Current password is incorrect.',
                messageType: 'error',
                userType: userType
            });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedNewPassword, userId]);

        // Success message after updating
        res.render('userManagement/changePassword', {
            message: 'Password updated successfully.',
            messageType: 'success',
            userType: userType
        });

    } catch (err) {
        console.error(err);
        res.render('userManagement/changePassword', {
            message: 'An error occurred. Please try again later.',
            messageType: 'error',
            userType: userType
        });
    }
});

router.get('/feedback', authenticateToken, async (req, res) => {
    const userId = req.user.id;  // Assuming the user ID is available in the JWT token
    const role = req.user.role;

    try {
        // Retrieve a list of incidents reported by the user
        const [incidents] = await pool.query('SELECT incident_id, title FROM incidents WHERE reported_by = ?', [userId]);

        console.log('Incidents:', incidents);
        // If no incidents are found, return a message
        if (incidents.length === 0) {
            return res.render('feedback/feedback', {
                incidents: [],
                userId,
                role,
                message: 'No incidents found to provide feedback for.', // You can customize this message
                messageType: 'error',
            });
        }

        // Render feedback form with incidents
        res.render('feedback/feedback', { 
            incidents, 
            userId,
            role,
            message: '' ,// Initial empty message if you need to show feedback after form submission
            messageType: 'success',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred. Please try again later.');
    }
});

router.post('/feedback', authenticateToken, async (req, res) => {
    const { incident_id, rating, comments } = req.body;  // Get feedback details from the form
    const userId = req.user.id;  // Get user ID from JWT token
    const role = req.user.role;
    try {
        // Insert the feedback into the database
        await pool.query('INSERT INTO feedback (incident_id, user_id, rating, comments) VALUES (?, ?, ?, ?)', 
            [incident_id, userId, rating, comments]);

        // Retrieve a list of incidents reported by the user
        const [incidents] = await pool.query('SELECT incident_id, title FROM incidents WHERE reported_by = ?', [userId]);
            console.log('title',incidents.title)
        // If no incidents found, send a message or an empty array
        const message = incidents.length === 0 ? 'You have no incidents reported.' : 'Feedback submitted successfully!';
        const messageType = incidents.length === 0 ? 'info' : 'success';

        // Re-render the feedback form with the message, incidents (or empty), and user data
        res.render('feedback/feedback', {
            incidents,         // Pass incidents array (empty if none)
            userId,
            role,
            message,           // Message for the user
            messageType,       // Type of message (success/info)
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send('An error occurred. Please try again later.');
    }
});

// Route for admin to view feedback
router.get('/admin/feedback', authenticateToken, async (req, res) => {
    const userId = req.user.id;  // Assuming the user ID is available in the JWT token
    const role = req.user.role;

    try {
        // Query to retrieve feedback data along with related incident and user info
        const [feedbacks] = await pool.query(`
            SELECT feedback.feedback_id, feedback.incident_id, feedback.user_id, feedback.rating, feedback.comments, feedback.submitted_at, 
                   users.name AS user_name, incidents.description AS incident_description
            FROM feedback
            JOIN users ON feedback.user_id = users.user_id
            JOIN incidents ON feedback.incident_id = incidents.incident_id
            ORDER BY feedback.submitted_at DESC
        `);

        console.log('Feedbacks:', feedbacks);
        // If no feedback is found, return a message
        if (feedbacks.length === 0) {
            return res.render('feedback/adminViewFeedback', {
                feedbacks: [],
                userId,
                role,
                message: 'No feedback found.', // You can customize this message
            });
        }

        // Render the feedback view with data
        res.render('feedback/adminViewFeedback', {
            feedbacks,
            userId,
            role,
            message: '' // Initial empty message, you can modify it based on further logic
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while retrieving feedback. Please try again later.');
    }
});
//signout route
router.get('/signout', (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/signin');
});


module.exports = router;