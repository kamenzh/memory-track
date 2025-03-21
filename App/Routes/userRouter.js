const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schemas/userSchema');
const { accessCheckJWT } = require('../middleware/middleware');

router.use(accessCheckJWT); 

router.get('/:id', async(req, res) =>{
    try {
        // Message managment
        const {message} = req.cookies || null;

        // Manage id param format 
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.cookie('message', 'User doesnt exist', { maxAge: 6000, httpOnly: true });
            return res.redirect('/');
        }

        // Verified user access only to his own account
        if (req.user.id !== id) {
            res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
            return res.redirect('/');
        }

        // Find User & Existence Check
        const currentUser = await User.findOne({id: req.params.id});
        if (!currentUser) {
            res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true });
            return res.redirect('/');
        }
        res.status(200).render('user', { currentUser, message });
        
    }catch (error) {
        return res.status(500).json({ message: error.message}); // error handling 
    } 
});

router.patch('/:id', async (req, res) => {
    try {
        // Message managment
        const {message} = req.query || null;

        // Manage id param format 
        const id = parseInt(req.params.id);
        if(isNaN(id)) return res.status(400).redirect('/?message=User%20doesnt%20exist');

        if (req.user.id !== id) {
            res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
            return res.redirect('/');
        }

        // Find User & Existence Check
        const currentUser = await User.findOne({id: req.params.id});
        if(!currentUser) return res.redirect('/?message=Invalid%20User');
    
        // const {}        
    }catch (error) {
        return res.status(500).json({ message: error.message}); // error handling 
    } 
});


router.delete('/:id', async(req, res) =>{
    try {
        // Message managment
        const {message} = req.cookies || null;

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.cookie('message', 'User doesnt exist', { maxAge: 6000, httpOnly: true });
            return res.redirect('/');
        }


        // Verified user access only to his own account
        if (req.user.id !== id) {
            res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
            return res.redirect('/');
        }

        // Find User & Existence Check
        await User.findOneAndDelete({id: req.params.id});
        
        res.redirect('/');
        
    }catch (error) {
        res.cookie('message', (error.message), { maxAge: 6000, httpOnly: true });
        return res.redirect(`/user/${req.params.id}`);  // error handling 
    } 
});

module.exports = router;