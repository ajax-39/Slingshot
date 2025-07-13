import { useState } from "react";
import {
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import NSEApiService from "../utils/nseApiService";

const AutoDownload = ({ onDownload, onServerStatus }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', 'info'
  const [serverHealthy, setServerHealthy] = useState(null);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const checkServerHealth = async () => {
    try {
      const health = await NSEApiService.checkServerHealth();
      setServerHealthy(health.healthy);
      onServerStatus?.(health);

      if (!health.healthy) {
        showMessage(
          "Server is not responding. Please check if the backend is running.",
          "error"
        );
      } else {
        showMessage("Server is online and ready!", "success");
      }

      return health.healthy;
    } catch (error) {
      setServerHealthy(false);
      showMessage(
        "Cannot connect to server. Please ensure the backend is running.",
        "error"
      );
      return false;
    }
  };

  const handleAutoDownload = async () => {
    setIsDownloading(true);
    setMessage("");

    try {
      // First check server health
      const isHealthy = await checkServerHealth();
      if (!isHealthy) {
        return;
      }

      showMessage("Connecting to NSE website and downloading data...", "info");

      const result = await NSEApiService.downloadMarketData();

      if (result.success && result.file) {
        // Process the downloaded file through existing CSV upload logic
        const fileName = result.filename;

        showMessage("Processing downloaded data...", "info");

        // Call the parent's upload handler with the downloaded file
        await onDownload(result.file, fileName);

        showMessage(
          `✅ Successfully downloaded and processed ${fileName}! (${(
            result.size / 1024
          ).toFixed(1)} KB)`,
          "success"
        );
      } else {
        throw new Error("Download completed but no file was received");
      }
    } catch (error) {
      console.error("Auto download error:", error);
      showMessage(`❌ Download failed: ${error.message}`, "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "info":
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getMessageClass = () => {
    switch (messageType) {
      case "success":
        return "bg-green-900/20 border-green-500/30 text-green-300";
      case "error":
        return "bg-red-900/20 border-red-500/30 text-red-300";
      case "info":
        return "bg-blue-900/20 border-blue-500/30 text-blue-300";
      default:
        return "";
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Auto Download</h3>
            <p className="text-sm text-gray-400">
              Get latest NSE market data automatically
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {serverHealthy !== null && (
            <div className="flex items-center space-x-1">
              {serverHealthy ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-xs ${
                  serverHealthy ? "text-green-400" : "text-red-400"
                }`}
              >
                {serverHealthy ? "Online" : "Offline"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-3">
          <button
            onClick={handleAutoDownload}
            disabled={isDownloading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDownloading
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25"
            }`}
          >
            {isDownloading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isDownloading ? "Downloading..." : "Download NSE Data"}
            </span>
          </button>

          <button
            onClick={checkServerHealth}
            disabled={isDownloading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-200"
          >
            <Wifi className="w-4 h-4" />
            <span>Check Server</span>
          </button>
        </div>

        {message && (
          <div
            className={`flex items-start space-x-3 p-3 rounded-lg border ${getMessageClass()}`}
          >
            {getMessageIcon()}
            <p className="text-sm whitespace-pre-line">{message}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-900/50 p-3 rounded border border-gray-700">
          <p className="mb-1">
            ⚠️ <strong>Important:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure the backend server is running on port 3001</li>
            <li>This feature requires automated access to NSE India website</li>
            <li>
              Rate limited to 5 downloads per minute for server protection
            </li>
            <li>Please verify compliance with NSE terms of service</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AutoDownload;
