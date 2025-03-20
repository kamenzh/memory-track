const { verifyJWT } = require("../JWT/jwtUtils");
const jwt = require('jsonwebtoken');
const User = require('../Schemas/userSchema'); // require the User Schema

function logger(req,res,next){
    console.log(`${req.originalUrl} : ${req.method}`);
    next();
};

// # User can access ONLY HIS User Page
const accessCheckJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token){
        return res.status(401).redirect('/');
    }
    const decoded = verifyJWT(token);
    if (!decoded) return res.status(403).redirect('/'); 
    
    req.user = decoded;
    next();
};

// # Pass currentUser to the frontend
async function attachUser(req, res, next) {
  if (req.cookies.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      const currentUser = await User.findOne({ id: decoded.id });
      res.locals.currentUser = currentUser;
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
}

module.exports = {accessCheckJWT , logger, attachUser};