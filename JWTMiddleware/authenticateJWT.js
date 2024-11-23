// Import jsonwebtoken for token creation and verification
const jwt = require('jsonwebtoken');

// Load the environment variables from .env file such as JWT_SECRET and JWT_EXPIRY
require('dotenv').config();

// Middleware function to authenticate JWT tokens
const authenticateJWT = (req, res, next)=>{
    // Extract the authorization header from the incoming request
    const authHeader = req.headers.authorization;
    if(authHeader){
        // JWT tokens are typically passed as 'Bearer <token>' so we split the string to extract the actual token
        const token = authHeader.split(' ')[1];

        // Verify the token using the secret key from the .env file
        jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
            if(err){
                // If token verification fails(for example, token expired or invalid), return a 403 forbidden error
                return res.status(403).json({message: 'Invalid or expired token'});
            }
            // if the token is valid, attach the decoded user information(from the token payload) to the request object
            req.user = user;

            // Call the next middleware or route handler
            next()
        });
    } else{
        // If no authorization header is provided, return a 401 unauthorized error
        res.status(403).json({message: 'Token required for authentication.'});
    }
}

// Export the middleware function for use in the other parts of applcation
module.exports = authenticateJWT;