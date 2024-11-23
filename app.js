// Import the necessary packages
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const db = require('./config/db');

// Import authentication routes
const authRoutes = require('./router/auth');

// Initialize the express application
const app = express();

// Setup the port for the server
const port = process.env.DB_PORT || 3500;

// Middleware to pass incoming JSON requests
app.use(express.json());

// Middleware to pass URL-encoded data
app.use(express.urlencoded({extended: true}));

// Use or mount authentication routes
app.use('/auth', authRoutes);

// Start the server
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});