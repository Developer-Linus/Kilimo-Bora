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
        const [ existingUser ] = await db.execute('SELECT * FROM users WHERE email=?', [email]);

        if(existingUser.length > 0){
            return res.status(400).json({message: 'User already exists'});
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

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
            firstName: user.first_name,
            lastName: user.last_name,
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
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role
        } });
    } catch(error){
        console.error('Error occcured in logging you in', error);
        res.status(500).json({message: 'Error occured while processing your request.'});
    }
}
// Add Contact Us message
exports.addContactMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        const { name, email, message } = req.body;

        // Insert message into the contactus table
        await db.execute(
            'INSERT INTO contactus (name, email, message, status) VALUES (?, ?, ?, ?)',
            [name, email, message, 'pending']
        );

        res.status(201).json({ message: 'Message successfully sent.' });
    } catch (error) {
        console.error('Error adding contact message:', error);
        res.status(500).json({ message: 'Server error while adding contact message.' });
    }
}

// Retrieve tips
exports.getTips = async (req, res) => {
    try{
        // Fetch all tips
        const [tips] = await db.execute(`
            SELECT t.tip_id, t.title, t.content, t.user_id, COUNT(c.comment_id) AS comment_count
            FROM tips t
            LEFT JOIN comments c ON t.tip_id = c.tip_id
            GROUP BY t.tip_id;
            `);
        
        // Respond with tips
        res.status(200).json({ tips });
    } catch(error){
        console.error('Error fetching tips:', error);
        res.status(500).json({ message: 'Server error while fetching tips.'});
    }
}

// Retrieve comments for specific tip
exports.getComments = async (req, res) =>{

    const { tipId } = req.params;

    try{
        // Fetch comments for the given tip
        const [ comments ] = await db.execute(`
            SELECT c.comment_id, c.comment, c.user_id, u.first_name, u.last_name
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.tip_id = ?;
            `, [tipId]);
        // Respond with comments
        res.status(200).json({ comments });
    } catch(error){
        console.error('Error fetching comments:', error);
        res.status(500).json({message: 'Server error while fetching comments.'});
    }
};

// Function to view user profile
exports.viewProfile = async (req, res) => {
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header is present and properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header is missing or improperly formatted.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from Authorization header

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user details from the database using the userId from the decoded token
        const [rows] = await db.execute(
            'SELECT first_name AS firstName, last_name AS lastName, email FROM users WHERE user_id = ?',
            [decoded.userId]
        );

        // Check if user exists in the database
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user details
        const user = rows[0];
        return res.status(200).json({ user });
        console.log(user);
    } catch (error) {
        console.error('Error verifying token or querying database:', error);

        // Handle token verification errors or other unexpected issues
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }

        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};



