const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Schemas/userSchema'); 
const { createJWT } = require('../JWT/jwtUtils');

const JWT_SECRET = process.env.JWT_SECRET;


// # Login Page
router.get('/login', (req, res) => {
    // Message managment
    const {message} = req.cookies || null;
    res.clearCookie('message');
    // Render login and pass message
    res.render('login', {message: message});

});

// # Login Request
router.post('/login', async(req, res) => {
    try {
        // Extract data sent to the body & format user input
        const username = req.body.username.trim();
        const password = req.body.password.trim();
        
        // Find user and check for existence
        const currentUser = await User.findOne({username: username});
        if(!currentUser) {
            res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true }); 
            return res.redirect('/auth/login');
        }
    
        // Password Check 
        const isMatch = await bcrypt.compare(password, currentUser.password);
        if(isMatch){

            // # Creating the JWT token
            const { id } = currentUser;
            const token = createJWT(id, username);

            // Send Token in a Cookie
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 7200000, // 2 hour expiration
            });
            
            res.cookie('message', 'Login Successful', { maxAge: 6000, httpOnly: true }); 
            return res.redirect(`/user/${currentUser.id}`);
        }
        else{
            res.cookie('message', 'Invalid password', { maxAge: 6000, httpOnly: true });
            return res.redirect('/auth/login');
        }

    } catch (error) {
        res.cookie('message', (error.message), { maxAge: 6000, httpOnly: true }); 
        return res.redirect('/auth/login');
    }
});



// # Signup Page 
router.get('/signup', (req, res) => {
    // Message managment
    const {message} = req.cookies || null;
    res.clearCookie('message');
    res.render('signup', {message: message});
});

// # Signup Request
router.post('/signup', async(req, res) => {
    try {
        // Extract data sent to body & format user input
        const username = req.body.username.trim();
        const password = req.body.password.trim();
        const email = req.body.email.trim().toLowerCase();
        const displayName = req.body.displayName.trim(); 
    
        // Existing user check 
        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if(existingUser) { res.cookie('message', `User ${existingUser.username} already exists`, { maxAge: 6000, httpOnly: true });
        return res.redirect('/auth/signup');
     }

        // Last Id check
        const lastUser = await User.findOne().sort({ id: -1 });
        const newId = lastUser ? lastUser.id + 1 : 1; // Increment ID

        // Hash & Salt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);

        // Creating the new user
        const currentUser = new User({id: newId,username,email,displayName,password: hashedPassword});
        await currentUser.save();

        // # Creating the JWT token
        const {id} = currentUser;
        const token = createJWT(id, username);

        res.cookie("jwt", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "Strict",
            maxAge: 7200000, // 2 hour expiration
        });

        // redirect to its user page
        res.cookie('message', 'Successfully Created An Account', { maxAge: 6000, httpOnly: true });
        return res.redirect(`/user/${currentUser.id}`);
        
    } catch (error) {
        res.cookie('message', (error.message), { maxAge: 6000, httpOnly: true });
        return res.redirect('/auth/signup');
    }
});


// # Logout
router.get('/logout',(req, res) => {
    res.clearCookie('jwt');
    res.cookie('message', 'Logged out Successfully', { maxAge: 6000, httpOnly: true });
    res.redirect('/');
});

module.exports = router;