// Stricter version of the auth middleware — only lets Admin users through.
// Use this on any route that shouldn't be accessible to orgs or individuals.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "kamp_secret_key_2026";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    // 403 (not 401) — the token is valid, but this person just doesn't have the right role
    if (!user || user.type !== "Admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    
    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

module.exports = adminAuth;
