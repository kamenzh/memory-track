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
    const {message} = req.query || null;

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
        if(!currentUser) return res.redirect('/auth/login?message=Invalid%20User');
    
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
            
            return res.redirect(`/user/${currentUser.id}?message=Login%20Successfull`);
        }
        
        else{
            return res.redirect('/auth/login?message=Invalid%20password');
        }

    } catch (error) {
        return res.redirect(`/auth/login?message=${encodeURIComponent(error.message)}`);
    }
});



// # Signup Page 
router.get('/signup', (req, res) => {
    // Message managment
    const {message} = req.query || null;
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
        if(existingUser) return res.redirect(`/auth/signup?message=User%20${encodeURIComponent(existingUser.username)}%20already%20exists`);
    
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
        res.redirect(`/user/${currentUser.id}?message=Succesfuly%20Created%20An%20Account`);
        
    } catch (error) {
        return res.redirect(`/auth/signup?message=${encodeURIComponent(error.message)}`);
    }
});


// # Logout
router.get('/logout',(req, res) => {
    res.clearCookie('jwt');
    res.redirect('/?message=Logged%20out%20Successfuly');
});

module.exports = router;