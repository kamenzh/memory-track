const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "Secret";
const EXPIRATION = process.env.JWT_EXPIRATION || "2h";

const createJWT = (id, username) => {
    return jwt.sign({ id, username }, SECRET_KEY, { expiresIn: EXPIRATION });
};

const verifyJWT = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
};

module.exports = { createJWT, verifyJWT };
