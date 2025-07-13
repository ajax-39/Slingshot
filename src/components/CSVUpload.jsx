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
      const result = await parseCSVFile(file, file.name);
      onUpload(result.data, result.stats);

      // Show detailed success message
      let successMsg = `Successfully processed ${file.name}!\n`;
      successMsg += `Added: ${result.stats.addedCount} new stocks`;
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
            minWidth: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Heatmap
        </a>
        <a
          href="https://www.nseindia.com/market-data/top-gainers-losers"
          target="_blank"
          rel="noopener noreferrer"
          className="external-link-button gainers-btn"
          style={{
            minWidth: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
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
        >
          <div className="upload-icon">
            <FileText size={48} />
          </div>

          <h3>Drop your CSV file here</h3>
          <p>or click to browse and select</p>

          <div style={{ marginTop: "16px", fontSize: "14px", color: "#888" }}>
            <p>
              <strong>Required columns:</strong>
            </p>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              <li>SYMBOL</li>
              <li>LTP</li>
              <li>%CHNG</li>
              <li>VOLUME (shares)</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              <strong>Note:</strong> Duplicate stocks (same SYMBOL) will be
              skipped
            </p>
          </div>
          <div
            className="upload-button-group"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "16px",
            }}
          >
            <button
              className="upload-button"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
              style={{ minWidth: "120px" }}
            >
              <Upload size={16} />
              {uploading ? "Processing..." : "Choose File"}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="file-input"
        />
      </div>
    </>
  );
};

export default CSVUpload;
