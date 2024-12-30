// Import necessary packages/dependencies
const db = require('../config/db');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// load environment variables
dotenv.config();

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this path exists in your project
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware for handling file uploads
exports.upload = upload.single('profile_image'); // Matches the `name` attribute in the form



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

// Function to update profile
exports.updateProfile = async (req, res) => {
    try {
        // Extract authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        // Verify JWT
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ message: 'Unauthorized: Invalid token' });
        }

        const userIdFromToken = decoded.userId;

        const { first_name, last_name, email } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ message: 'First name, last name, and email are required' });
        }

        // Ensure profile_image is null if no file is uploaded
        let profile_image = req.file ? req.file.filename : null;

        // SQL query for updating profile
        const updateQuery = `
            UPDATE users
            SET first_name = ?, 
                last_name = ?, 
                email = ?, 
                profile_image = COALESCE(?, profile_image)
            WHERE user_id = ?
        `;
        const params = [
            first_name || null, // Default to null if undefined
            last_name || null,  // Default to null if undefined
            email || null,      // Default to null if undefined
            profile_image, 
            userIdFromToken
        ];

        console.log('SQL Query Params:', params); // Debugging: Log query parameters

        const [result] = await db.execute(updateQuery, params);

        // Handle result
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        // Log server error
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
            SELECT 
            t.tip_id,
            t.title,
            t.content,
            u.first_name AS author,
            COUNT(c.tip_id) AS comments,
            COUNT(l.like_id) AS likes
            FROM 
                tips t
            JOIN 
                users u ON t.user_id = u.user_id
            LEFT JOIN 
                comments c ON t.tip_id = c.tip_id
            LEFT JOIN 
                likes l ON t.tip_id = l.tip_id
            GROUP BY 
                t.tip_id, u.first_name;
            `);
        
        // Respond with tips
        res.status(200).json({ tips });
    } catch(error){
        console.error('Error fetching tips:', error);
        res.status(500).json({ message: 'Server error while fetching tips.'});
    }
}

// Create a new tip
exports.createTip = async (req, res) => {
    try {
        // Ensure req.user is populated
        const userId = req.user?.userId; // Match the payload structure in the login function
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
        }

        // Extract title and content from the request body
        const { title, content } = req.body;

        // Validate input fields
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        // Insert the new tip into the database
        const [result] = await db.execute(
            `INSERT INTO tips (title, content, user_id) VALUES (?, ?, ?)`,
            [title, content, userId]
        );

        // Respond with success
        res.status(201).json({
            message: 'Tip created successfully.',
            tip: {
                tip_id: result.insertId,
                title,
                content,
                user_id: userId,
            },
        });
    } catch (error) {
        console.error('Error creating tip:', error);
        res.status(500).json({ message: 'Server error while creating tip.' });
    }
};




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

// Function to add a comment for a specific tip
exports.addComment = async (req, res) => {
    const { tipId } = req.params; // Extract tipId from the route
    const { userId, comment } = req.body; // Get userId and comment from the request body

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    try {
        // Insert the new comment into the database
        await db.execute(
            `INSERT INTO comments (tip_id, user_id, comment) VALUES (?, ?, ?)`,
            [tipId, userId, comment]
        );

        res.status(201).json({ success: true, message: 'Comment added successfully.' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error while adding comment.' });
    }
};

// Function to fetch likes for a specific tip
exports.getLikes = async (req, res) => {
    const { tipId } = req.params; // Extract the tipId from the route
    const userId = req.query.userId; // Optionally get the userId from query parameters

    try {
        // Query to count total likes for the given tip
        const [totalLikesResult] = await db.execute(
            `SELECT COUNT(*) AS total_likes FROM likes WHERE tip_id = ?`,
            [tipId]
        );

        const totalLikes = totalLikesResult[0]?.total_likes || 0;

        // Query to check if the user has liked the tip
        let userHasLiked = false;
        if (userId) {
            const [userLikeResult] = await db.execute(
                `SELECT COUNT(*) AS user_liked FROM likes WHERE tip_id = ? AND user_id = ?`,
                [tipId, userId]
            );
            userHasLiked = userLikeResult[0]?.user_liked > 0;
        }

        // Send the response
        res.status(200).json({ total_likes: totalLikes, user_has_liked: userHasLiked });
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ message: 'Server error while fetching likes.' });
    }
};

// Function to update likes
exports.toggleLike = async (req, res) => {
    const { tipId } = req.params; // Extract the tipId from the route
    const { userId } = req.body; // User ID should be sent in the request body

    try {
        // Check if the user has already liked the tip
        const [existingLike] = await db.execute(
            `SELECT like_id FROM likes WHERE tip_id = ? AND user_id = ?`,
            [tipId, userId]
        );

        if (existingLike.length > 0) {
            // If a like exists, remove it (unlike)
            await db.execute(`DELETE FROM likes WHERE like_id = ?`, [existingLike[0].like_id]);
            res.status(200).json({ success: true, action: 'unliked', message: 'Like removed.' });
        } else {
            // If no like exists, add a new like
            await db.execute(
                `INSERT INTO likes (tip_id, user_id) VALUES (?, ?)`,
                [tipId, userId]
            );
            res.status(200).json({ success: true, action: 'liked', message: 'Like added.' });
        }
    } catch (error) {
        console.error('Error updating like:', error);
        res.status(500).json({ message: 'Server error while updating like.' });
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
            'SELECT first_name AS firstName, last_name AS lastName, email, profile_image FROM users WHERE user_id = ?',
            [decoded.userId]
        );

        // Check if user exists in the database
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the user details and profile image path
        const user = rows[0];

        // Construct the profile image URL (adjust path as needed for your app)
        const profileImageUrl = user.profile_image ? `/uploads/${user.profile_image}` : null;

        // Return user details along with the profile image URL
        return res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: profileImageUrl, // Include profile image URL
            }
        });
    } catch (error) {
        console.error('Error verifying token or querying database:', error);

        // Handle token verification errors or other unexpected issues
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }

        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};




