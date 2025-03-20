const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose); // npm i mongoose-sequence

const UserSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            unique: true,
        },
        username: {
            type: String,
            required: [true,"Please enter a username"],
            unique: true

        },
        email: {
            type: String,
            required: [true,"Please enter an email"],
            unique: true

        },
        displayName: {
            type: String,
            required: [false,"Please enter a username"],
            default: "User",
            unique: false
        },
        password: {
            type: String,
            unique: false, 
            required: [true, "Enter a Password"]
        }
    },
    {timestamps:true}, 
);

UserSchema.plugin(AutoIncrement, { inc_field: "id" }); // custom id incrementation
UserSchema.pre("save", async function (next) {
    if (!this.id) {
        const lastUser = await this.constructor.findOne().sort({ id: -1 }); // Get last user
        this.id = lastUser ? lastUser.id + 1 : 1; // Increment ID manually
    }
    next();
}); 
const User = mongoose.model("User", UserSchema);
module.exports = User;