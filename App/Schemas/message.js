const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    groupChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupChat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Message", MessageSchema);