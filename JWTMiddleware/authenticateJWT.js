// Import jsonwebtoken for token creation and verification
const jwt = require('jsonwebtoken');

// Load the environment variables from .env file such as JWT_SECRET
require('dotenv').config();

// Middleware function to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
    // Extract the authorization header from the incoming request
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If no authorization header or invalid format is provided, return a 401 Unauthorized error
        return res.status(401).json({ message: 'Authorization header is missing or improperly formatted.' });
    }

    // JWT tokens are typically passed as 'Bearer <token>', so split the string to extract the actual token
    const token = authHeader.split(' ')[1];

    // Verify the token using the secret key from the .env file
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // If token verification fails (e.g., token expired or invalid), return a 403 Forbidden error
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // If the token is valid, attach the decoded user information (from the token payload) to the request object
        req.user = user;

        // Call the next middleware or route handler
        next();
    });
};

// Export the middleware function for use in other parts of the application
module.exports = authenticateJWT;