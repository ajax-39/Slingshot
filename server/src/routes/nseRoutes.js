// Routes for NSE data download API
import express from "express";
import NSEScrapingService from "../services/nseScrapingService.js";
import Logger from "../utils/logger.js";

const router = express.Router();
const nseService = new NSEScrapingService();

// Health check endpoint
router.get("/health", (req, res) => {
  Logger.info("Health check requested from %s", req.ip);
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Ajax NSE Server",
  });
});

// Main download endpoint
router.get("/download-nse-csv", async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  Logger.info("[%s] NSE CSV download requested from %s", requestId, req.ip);

  try {
    // Log request details
    Logger.debug("[%s] Request headers: %j", requestId, req.headers);
    Logger.debug("[%s] User agent: %s", requestId, req.get("User-Agent"));

    Logger.info("[%s] Starting NSE data download process...", requestId);

    const result = await nseService.downloadMarketData();

    if (!result.success) {
      throw new Error("Download service returned unsuccessful result");
    }

    Logger.success(
      "[%s] Download completed successfully - %d bytes in %dms",
      requestId,
      result.size,
      result.downloadTime
    );

    // Set appropriate headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("X-Download-Time", result.downloadTime);
    res.setHeader("X-File-Size", result.size);

    // Send the file content
    res.send(result.data);

    Logger.info("[%s] Response sent successfully to client", requestId);
  } catch (error) {
    Logger.error("[%s] Download failed: %s", requestId, error.message);
    Logger.debug("[%s] Error stack: %s", requestId, error.stack);

    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = "Internal server error occurred";

    if (
      error.message.includes("timeout") ||
      error.message.includes("navigate")
    ) {
      statusCode = 504;
      errorMessage = "NSE website is not responding or taking too long";
    } else if (
      error.message.includes("download button") ||
      error.message.includes("not found")
    ) {
      statusCode = 502;
      errorMessage = "NSE website structure may have changed";
    } else if (error.message.includes("No CSV file")) {
      statusCode = 502;
      errorMessage = "Download was triggered but no file was received";
    }

    res.status(statusCode).json({
      error: errorMessage,
      message: error.message,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      statusCode: statusCode,
    });
  }
});

// Error handling for this router
router.use((error, req, res, next) => {
  const requestId = req.requestId || "unknown";
  Logger.error("[%s] Unhandled route error: %s", requestId, error.message);
  Logger.debug("[%s] Error stack: %s", requestId, error.stack);

  res.status(500).json({
    error: "Unexpected error occurred",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
    requestId: requestId,
    timestamp: new Date().toISOString(),
  });
});

export default router;
