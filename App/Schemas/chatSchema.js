const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ChatSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

ChatSchema.plugin(AutoIncrement, { inc_field: "id" });

module.exports = mongoose.model("Chat", ChatSchema);
