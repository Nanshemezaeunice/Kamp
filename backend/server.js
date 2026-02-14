const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// CORS configuration for frontend URLs (local dev, Netlify, and Render)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://enchanting-nougat-bdb9ef.netlify.app",
  "https://kamp-7waq.onrender.com",
];

// Custom CORS middleware with explicit header handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Also apply cors middleware as backup
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // Allow all origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/admin/members", require("./routes/adminMemberRoutes"));
app.use("/api/admin/organizations", require("./routes/adminOrgRoutes"));
app.use("/api/admin/supporters", require("./routes/adminSupporterRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/organization/members", require("./routes/orgMemberRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "KAMP API is running" });
});

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to KAMP API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found", path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
