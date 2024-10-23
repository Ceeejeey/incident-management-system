require('dotenv').config();

const express = require('express');
const { pool , checkConnection} = require('./config/config');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use("/", require("./routes/pages"));
app.use("/api", require("./controllers/authController"));

// Socket.io setup
const userSockets = {};

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('A user connected');

    // Register the user on the socket
    socket.on('register', (user) => {
        socket.user = user; // Store user info in socket for later reference
    });

    // Listen for chat messages
    socket.on('chat message', async (data) => {
        const { message, sender, receiver } = data;

        // Get the current timestamp
        const timestamp = new Date(); // Create a new timestamp

        // Save the message to the database
        try {
            await pool.query('INSERT INTO messages (sender_id, receiver_id, message, timestamp, isread) VALUES (?, ?, ?, ?, ?)', [
                sender.user_id,
                receiver.user_id,
                message,
                timestamp, // Include the timestamp
                0 // is_read
            ]);

            // Emit the message to the receiver
            io.to(receiver.user_id).emit('chat message', {
                user: sender,
                message,
                timestamp: timestamp, // Send the timestamp to the client
            });
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        await checkConnection();
    } catch (error) {
        console.log("Failed to initialize database", error);
    }
});
