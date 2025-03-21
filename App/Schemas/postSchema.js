const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose); // npm i mongoose-sequence

const PostSchema = new mongoose.Schema({
    id:{
        type: Number,
        unique: true,
    },
    title:{
        type:String,
        required: [true,"Please enter a title"],
        unique: false
    },
    description:{
        type: String,
        required: [true,"Please enter a description"],
        unique: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    date:{
        type: Date,
        required: [true,"Please enter a date"],
        default: Date.now
    },
    participants: [{ // Tagging friends
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    accessGroups: [{ // Groups which teh user give access to his post
        type: String
    }],
    picture: {
        type: String,
        default: ''
    },
    createdBy: { // Whose is the post
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},

{ timestamps: true }

);

PostSchema.index({ location: "2dsphere" });
PostSchema.plugin(AutoIncrement, { inc_field: "id" });

module.exports = mongoose.model('Post', postSchema)