// Import necessary packages/dependencies
const db = require('../config/db');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// load environment variables
dotenv.config();

// Function to handle user registration
exports.registerUser = async(req, res)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({error: errors.array()});
        }
        // Define the request body
        const { firstName, lastName, email, password } = req.body;

        // Check if the user already exists
        const [existingUser ] = await db.execute('SELECT * FROM users WHERE email=?', [email]);

        if(existingUser.length>0){
            return res.status(400).json({message: 'User already exists'});
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 15);

        // Insert the user into the database
        await db.execute('INSERT INTO users(first_name, last_name, email, password_hash) VALUES(?, ?, ?, ?)', [firstName, lastName, email, hashedPassword]);

        res.status(201).json({message: 'User successfully registered.'});

    } catch(error){
        console.error('Error in registering the user', error);
        res.status(500).json({message: 'Server error.'});
    }
}

// Login function
exports.loginUser = async(req, res)=>{
    // Define request body
    const { email, password } = req.body;
    try{
        // Check if the user exists in the database
        const[users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if(users.length===0){
           return res.status(401).json({message: 'Invalid email or password.'});
        }

        //Define a variable to hold the user fetched from the database
        const user = users[0];

        // Compare the provided password with the hashed password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if(!isValidPassword){
           return res.status(401).json({message: 'Invalid email or password.'});
        }

        // Generate JWT token
        const payload = {
            userId: user.user_id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY || '2h'});

        // Set the JWT token as an HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true, // Prevent access to cookies via JavaScript
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
            maxAge: 2*60*60*1000, // Matches the token expiry time
        });

        // Return the token and user details
        res.status(200).json({message: 'Login successful', token, user:{
            userId: user.user_id,
            email: user.email,
            role: user.role
        } });
    } catch(error){
        console.error('Error occcured in logging you in', error);
        res.status(500).json({message: 'Error occured while processing your request.'});
    }
}

