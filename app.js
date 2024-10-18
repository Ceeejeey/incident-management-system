require('dotenv').config();

// Import required modules
const express = require('express');
const { checkConnection } = require('./config/config');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser'); 

// Initialize express app
const app = express();

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
app.use("/api", require("./controllers/authController")); // Fixed spelling for 'authController'

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
