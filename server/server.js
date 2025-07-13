import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import Logger from "./src/utils/logger.js";
import nseRoutes from "./src/routes/nseRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting - max 5 requests per minute per IP for download endpoint
const downloadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many download requests from this IP, please try again later.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting - max 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

app.use(generalLimiter);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  req.requestId = requestId;

  Logger.info("[%s] %s %s from %s", requestId, req.method, req.path, req.ip);

  // Log response when it finishes
  const originalSend = res.send;
  res.send = function (data) {
    Logger.info(
      "[%s] Response: %d %s",
      requestId,
      res.statusCode,
      res.statusMessage
    );
    originalSend.call(this, data);
  };

  next();
});

// Apply download rate limiting to specific endpoint
app.use("/api/download-nse-csv", downloadLimiter);

// Use routes
app.use("/api", nseRoutes);
app.use("/", nseRoutes); // For health check without /api prefix

// Global error handling middleware
app.use((error, req, res, next) => {
  const requestId = req.requestId || "unknown";
  Logger.error(
    "[%s] Unhandled application error: %s",
    requestId,
    error.message
  );
  Logger.debug("[%s] Error stack: %s", requestId, error.stack);

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
    requestId: requestId,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  Logger.warn("404 - Route not found: %s %s", req.method, req.originalUrl);
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(port, () => {
  Logger.start("Ajax NSE Server running on port %d", port);
  Logger.info("📊 Ready to download NSE market data");
  Logger.info("🔧 Environment: %s", process.env.NODE_ENV || "development");
  Logger.info(
    "🌐 CORS origin: %s",
    process.env.FRONTEND_URL || "http://localhost:5173"
  );

  if (process.env.NODE_ENV === "development") {
    Logger.debug("Debug mode enabled - detailed logging active");
  }
});
