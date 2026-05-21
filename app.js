require('dotenv').config();
const express = require('express');
const { pool, checkConnection } = require('./config/config');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', require('./controllers/authController'));
app.use('/api', require('./controllers/incidentController'));
app.use('/api', require('./controllers/userController'));
app.use('/api', require('./controllers/chatController'));
app.use('/api', require('./controllers/notificationController'));
app.use('/api', require('./controllers/feedbackController'));
app.use('/api', require('./controllers/emergancy_contact_list_controller'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io setup
const userSockets = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('register', (user) => {
    console.log('User registered:', user);
    socket.user = user;
    socket.join(String(user.id));
    console.log(`User ${user.name} registered and joined their room.`);
  });

  socket.on('chat message', async (data) => {
    console.log('Message received:', data);
    const { message, sender, receiver } = data;

    const timestamp = new Date();

    try {
      await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, message, timestamp, isread) VALUES (?, ?, ?, ?, ?)',
        [sender.id, receiver.user_id, message, timestamp, 0]
      );

      io.to(String(receiver.user_id)).emit('chat message', {
        user: sender,
        message,
        timestamp: timestamp.toISOString(),
      });

      console.log(`Message sent from ${sender.id} to ${receiver.user_id}: ${message}`);
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await checkConnection();
  } catch (error) {
    console.log('Failed to initialize database', error);
  }
});
