const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schemas/userSchema');
const { accessCheckJWT } = require('../middleware/middleware');

router.use(accessCheckJWT); 

router.get('/:id', async(req, res) =>{
    try {
        // Message managment
        const {message} = req.query || null;

        // Manage id param format 
        const id = parseInt(req.params.id);
        if(isNaN(id)) return res.status(400).redirect('/?message=User%20doesnt%20exist');

        // Verified user access only to his own account
        if (req.user.id !== id) {
            return res.status(403).redirect('/?message=You%20do%20not%20have%20access%20to%20this%20account');
        }

        // Find User & Existence Check
        const currentUser = await User.findOne({id: req.params.id});
        if(!currentUser) return res.redirect('/?message=Invalid%20User');
    
        res.status(200).render('user', {currentUser, message});
        
    }catch (error) {
        return res.status(500).json({ message: error.message}); // error handling 
    } 
});

router.patch('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).redirect('/?message=User%20doesnt%20exist');

        if (req.user.id !== id) {
            return res.status(403).redirect('/?message=You%20do%20not%20have%20access%20to%20this%20account');
        }

        let currentUser = await User.findOne({ id });
        if (!currentUser) return res.redirect('/?message=Invalid%20User');

        const { username, displayName, email } = req.body;

        // Safely update fields
        const updateFields = {};
        if (username) updateFields.username = username.trim();
        if (displayName) updateFields.displayName = displayName.trim();
        if (email) updateFields.email = email.trim().toLowerCase();

        currentUser = await User.findOneAndUpdate({ id }, updateFields, { new: true });

        res.redirect(`/user/${currentUser.id}?message=Update%20Successful`);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.delete('/:id', async(req, res) =>{
    try {
        // Message managment
        const {message} = req.query || null;

        const id = parseInt(req.params.id);
        if(isNaN(id)) return res.status(400).redirect('/?message=User%20doesnt%20exist');

        // Verified user access only to his own account
        if (req.user.id !== id) {
            return res.status(403).redirect('/?message=You%20do%20not%20have%20access%20to%20this%20account');
        }

        // Find User & Existence Check
        await User.findOneAndDelete({id: req.params.id});
        
        res.redirect('/');
        
    }catch (error) {
        return res.status(500).json({ message: error.message}); // error handling 
    } 
});

module.exports = router;