const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// CORS configuration - Allow specific origins but keep logs for troubleshooting
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://voluble-chimera-ae1d21.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl requests, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For debugging, log unauthorized origins but temporarily allow them
      console.log(`CORS request from: ${origin}`);
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Length', 'X-JSON-Response-Count'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/admin/members", require("./routes/adminMemberRoutes"));
app.use("/api/admin/organizations", require("./routes/adminOrgRoutes"));
app.use("/api/admin/supporters", require("./routes/adminSupporterRoutes")); // advocates
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/organization/members", require("./routes/orgMemberRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/project-manage", require("./routes/projectManagementRoutes"));

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
