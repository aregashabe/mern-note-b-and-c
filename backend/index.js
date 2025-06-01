import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

// MongoDB Connection (with improved error handling)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Crash app if DB fails
  });

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration (Production-Ready)
const allowedOrigins = [
  "http://localhost:5173",
  "https://clientnoteapp.vercel.app/"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `🚨 CORS blocked for ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  })
);

// Preflight OPTIONS handler (Critical for CORS)
app.options("*", cors());

// Routes
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";

app.get("/", (req, res) => {
  res.json({ status: "🏠 Backend root", message: "API is running!" });
});

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

// Error Handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log full error in development
  if (process.env.NODE_ENV !== "production") {
    console.error("💥 Error:", { statusCode, message, stack: err.stack });
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: process.env.NODE_ENV === "production" ? message : err.message
  });
});

// Server Listener (Vercel-compatible)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});