require('dotenv').config();

// Import required modules
const express = require('express');
const {checkConnection} = require('./config/config');

// Initialize express app
const app = express();

// Use middleware to serve static files from the "views" directory
app.use("/views", express.static(__dirname + "/views"));


//initialize view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Basic Route to Test Server
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/signin', (req,res) =>{
  res.render('signin');
})

app.get('/signup', (req,res) =>{
  res.render('signup');
})
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
