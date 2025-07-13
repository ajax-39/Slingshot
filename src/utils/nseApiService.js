// API service for NSE data automation

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export class NSEApiService {
  static async downloadMarketData() {
    try {
      const response = await fetch(`${API_BASE_URL}/download-nse-csv`, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a File object from the blob
      const filename =
        this.extractFilenameFromResponse(response) || "nse_market_data.csv";
      const file = new File([blob], filename, { type: "text/csv" });

      return {
        success: true,
        file,
        filename,
        size: blob.size,
      };
    } catch (error) {
      console.error("NSE API Error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the server. Please ensure the backend is running."
        );
      }

      throw new Error(error.message || "Failed to download market data");
    }
  }

  static extractFilenameFromResponse(response) {
    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        return filenameMatch[1];
      }
    }
    return null;
  }

  static async checkServerHealth() {
    try {
      const response = await fetch(
        `${API_BASE_URL.replace("/api", "")}/health`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server health check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        healthy: true,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error("Server health check failed:", error);
      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

export default NSEApiService;
