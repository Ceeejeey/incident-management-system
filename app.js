require('dotenv').config();

// Import required modules
const express = require('express');
const {checkConnection} = require('./config/config');
const bodyParser = require("body-parser");


// Initialize express app
const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
// Cookie and JSON parsing middleware
app.use(express.json());

// Use middleware to serve static files from the "views" directory
app.use("/views", express.static(__dirname + "/views"));




//initialize view engine
app.set('view engine', 'ejs');
app.set('views', './views');

//uses the routes
app.use("/", require("./routes/pages"));
app.use("/api", require("./controllers/authContoller"));

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
