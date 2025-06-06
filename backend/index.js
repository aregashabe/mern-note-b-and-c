import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

// Trust proxy (important for Vercel)
app.enable('trust proxy');

// Middleware
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://frontendnoteapp.vercel.app",
  "https://clientnoteapp.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = `🚨 CORS blocked for ${origin}`;
    console.warn(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Special preflight handler
app.options("*", cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";

app.get("/", (req, res) => {
  res.json({ 
    status: "🏠 Backend root", 
    message: "API is running!",
    allowedOrigins,
    corsEnabled: true
  });
});

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error("💥 Error:", { 
    statusCode, 
    message, 
    path: req.path,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack
    })
  });
});

// Server Configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔒 CORS Enabled for origins:", allowedOrigins);
});

export default app;