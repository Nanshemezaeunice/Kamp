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
