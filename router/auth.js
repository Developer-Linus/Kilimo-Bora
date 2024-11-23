// Import necessary packages/dependencies
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
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











module.exports = router;