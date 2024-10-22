require('dotenv').config();

const express = require('express');
// Initialize express app
const app = express();

// Import required modules
const { checkConnection } = require('./config/config');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser'); 
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);


// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true })); // Fix typo here
app.use(express.json());
app.use(cookieParser());
// Initialize view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory correctly


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
// Use routes
app.use("/", require("./routes/pages"));
app.use("/api", require("./controllers/authController")); 

// Socket.io connection for real-time chat
io.on('connection', (socket) => {
    const user = { role: 'student', name: 'John Doe' }; 

    // Listen for incoming messages
    socket.on('chat message', (msg) => {
        const messageData = {
            user,
            message: msg,
            timestamp: new Date().toLocaleTimeString(),
        };

        // Broadcast message to all users
        io.emit('chat message', messageData);
    });
});



// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        await checkConnection();
    } catch (error) {
        console.log("Failed to initialize database", error);
    }
});
