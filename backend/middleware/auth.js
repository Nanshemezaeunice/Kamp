// Generic auth middleware — validates JWT and attaches the full user object to req.
// Any route that needs to know who's calling should use this.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "kamp_secret_key_2026";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    // Re-fetch from DB so we always have the latest user info (e.g. after role changes)
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    
    // Attach both the raw id and the full document so downstream handlers have options
    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

module.exports = auth;
