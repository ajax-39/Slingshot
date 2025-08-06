import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { parseCSVFile } from "../utils/csvParser";

const CSVUpload = ({ onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const fileInputRef = useRef();

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showMessage("Please select a CSV file only.", "error");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      //new stocks
      
      const result = await parseCSVFile(file, file.name);
      onUpload(result, result.stats);

      // Show detailed success message
      let successMsg = `Successfully processed ${file.name}!\n`;
      successMsg += `Added: ${result.stats.addedCount} total stocks`;
      if (result.stats.slingshotCount > 0) {
        successMsg += `\nSlingshot stocks: ${result.stats.slingshotCount}`;
      }
      if (result.stats.regularCount > 0) {
        successMsg += `\nRegular stocks: ${result.stats.regularCount}`;
      }
      if (result.stats.skippedCount > 0) {
        successMsg += `\nSkipped: ${result.stats.skippedCount} duplicate stocks`;
      }

      showMessage(successMsg, "success");
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div
        className="external-links-bar"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <a
          href="https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20TOTAL%20MARKET"
          target="_blank"
          rel="noopener noreferrer"
          className="external-link-button heatmap-btn"
          style={{
            minWidth: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(30,60,114,0.15)",
            padding: "12px 20px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
            letterSpacing: "0.5px",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span role="img" aria-label="heatmap" style={{ marginRight: 8 }}>
            🔥
          </span>{" "}
          Heatmap
        </a>
        <a
          href="https://www.nseindia.com/market-data/top-gainers-losers"
          target="_blank"
          rel="noopener noreferrer"
          className="external-link-button gainers-btn"
          style={{
            minWidth: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(17,153,142,0.15)",
            padding: "12px 20px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
            letterSpacing: "0.5px",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span role="img" aria-label="top gainers" style={{ marginRight: 8 }}>
            🚀
          </span>{" "}
          Top Gainers
        </a>
      </div>
      <div className="csv-upload">
        <h2 className="text-center mb-20">Upload NSE Stock Data</h2>

        {message && (
          <div
            className={`${
              messageType === "error" ? "error-message" : "success-message"
            }`}
          >
            {messageType === "error" ? (
              <AlertCircle
                size={16}
                style={{ display: "inline", marginRight: "8px" }}
              />
            ) : (
              <CheckCircle
                size={16}
                style={{ display: "inline", marginRight: "8px" }}
              />
            )}
            {message}
          </div>
        )}

        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          style={{
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="upload-icon" style={{ marginBottom: "16px" }}>
            <FileText size={48} />
          </div>
          <h3
            style={{
              fontWeight: 600,
              fontSize: "1.2rem",
              marginBottom: "24px",
            }}
          >
            Drop CSV file here
          </h3>
          <button
            className="upload-button"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation();
              handleUploadClick();
            }}
            style={{
              minWidth: "140px",
              padding: "12px 20px",
              borderRadius: "8px",
              background: "linear-gradient(90deg,#434343 0%,#000000 100%)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "1rem",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.07)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Upload size={18} style={{ marginRight: 8 }} />
            {uploading ? "Processing..." : "Choose File"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="file-input"
            style={{ display: "none" }}
          />
        </div>
      </div>
    </>
  );
};

export default CSVUpload;
