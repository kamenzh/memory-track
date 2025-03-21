const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schemas/userSchema');
const Post = require('../Schemas/postSchema');

router.get('/posts', async(req, res) => {
    const posts = await Post.find({createdBy: req.currentUser.id});
});
router.post('/posts', async(req, res) => {
    
});