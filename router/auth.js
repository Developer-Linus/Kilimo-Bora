// Import necessary packages/dependencies
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const authenticateJWT = require('../JWTMiddleware/authenticateJWT');
const { body } = require('express-validator');

// route for user registration
router.post('/POST/register',
    // Validate and sanitize user inputs
    [
        body('firstName').notEmpty().withMessage('First name is required.').trim().escape(),
        body('lastName').notEmpty().withMessage('Last name is required.').trim().escape(),
        body('email').isEmail().withMessage('Email is required.').normalizeEmail(),
        body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long.')
    ], authController.registerUser
);

// Login route
router.post('/POST/login', [
    // Validate and sanitize inputs
    body('email').isEmail().withMessage('You must input an email address.').normalizeEmail().trim(),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long.').trim().escape()
], authController.loginUser);

// View profile route
router.get('/GET/profile', authenticateJWT, authController.viewProfile);

// Add contact us message
router.post('/POST/contactus', authController.addContactMessage);


// Retrieve all tips
router.get('/GET/tips', authController.getTips);

// Retrieve comments for a specific tip
router.get('/GET/tips/:tipId/comments', authController.getComments);

// Add a comment to a specific tip
router.post('/POST/:tipId/comments', authController.addComment);

// Route to fetch likes for a specific tip
router.get('/posts/:tipId/likes', authController.getLikes);

// Route to toggle (add/remove) a like for a specific tip
router.post('/posts/:tipId/like', authController.toggleLike);

// Route for updating profile
router.post('/POST/updateProfile',authController.upload, authController.updateProfile);
// Route for creating a new tip
router.post('/POST/createTip', authController.createTip);


module.exports = router;