require('dotenv').config();

// Import required modules
const express = require('express');
const {checkConnection} = require('./config/config');

// Initialize express app
const app = express();

// Basic Route to Test Server
app.get('/', (req, res) => {
  res.send('Welcome to the Campus Incident Management System API!');
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await checkConnection();
  } catch (error) {
    console.log("Failded to initialize database" , error);
  }
});
