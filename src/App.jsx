import { useState, useEffect } from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import CSVUpload from "./components/CSVUpload";
import StockTable from "./components/StockTable";
import FileUploadLog from "./components/FileUploadLog";
import {
  loadDataFromLocalStorage,
  saveDataToLocalStorage,
  clearLocalStorage,
  loadFileUploadLog,
  addFileToUploadLog,
  saveFirstUploadTime,
  getFirstUploadTime,
} from "./utils/localStorage";
import { isDataExpired } from "./utils/dateUtils";

function App() {
  const [stockData, setStockData] = useState([]);
  const [uploadLog, setUploadLog] = useState([]);
  const [currentView, setCurrentView] = useState("upload");

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadDataFromLocalStorage();
    const savedLog = loadFileUploadLog();
    const firstUploadTime = getFirstUploadTime();

    // Check if data is expired (older than 24 hours)
    if (firstUploadTime && isDataExpired(firstUploadTime)) {
      // Data is expired, clear everything
      clearLocalStorage();
    } else {
      // Data is still valid
      if (savedData && savedData.length > 0) {
        setStockData(savedData);
        setCurrentView("scanner");
      }

      if (savedLog && savedLog.length > 0) {
        setUploadLog(savedLog);
      }
    }
  }, []);

  const handleCSVUpload = (newData, stats) => {
    // Add status 'pending' to new entries
    const newDataWithStatus = newData.map((item) => ({
      ...item,
      status: "pending",
    }));

    // Merge with existing data - duplicates are already filtered in csvParser
    const mergedData = [...stockData, ...newDataWithStatus];

    setStockData(mergedData);
    saveDataToLocalStorage(mergedData);

    // Save first upload time if this is the first upload
    if (stockData.length === 0) {
      saveFirstUploadTime(stats.timestamp);
    }

    // Add to upload log
    const logEntry = addFileToUploadLog(
      stats.fileName,
      stats.timestamp,
      stats.addedCount,
      stats.skippedCount
    );

    // Update upload log state
    setUploadLog((prev) => [...prev, logEntry]);

    setCurrentView("scanner");
  };

  const handleAcceptEntry = (symbol) => {
    const updatedData = stockData.map((item) =>
      item.SYMBOL === symbol ? { ...item, status: "accepted" } : item
    );
    setStockData(updatedData);
    saveDataToLocalStorage(updatedData);
  };

  const handleRejectEntry = (symbol) => {
    const updatedData = stockData.map((item) =>
      item.SYMBOL === symbol ? { ...item, status: "rejected" } : item
    );
    setStockData(updatedData);
    saveDataToLocalStorage(updatedData);
  };

  const handleFlagEntry = (symbol) => {
    const updatedData = stockData.map((item) =>
      item.SYMBOL === symbol ? { ...item, status: "no setup" } : item
    );
    setStockData(updatedData);
    saveDataToLocalStorage(updatedData);
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all data?\n\nThis will permanently delete:\n• All uploaded stock data\n• File upload history\n\nThis action cannot be undone."
    );

    if (confirmed) {
      clearLocalStorage();
      setStockData([]);
      setUploadLog([]);
      setCurrentView("upload");
    }
  };

  return (
    <div className="app">
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        dataCount={stockData.length}
        onClearAllData={handleClearAllData}
      />

      <main className="main-content">
        {currentView === "upload" && (
          <>
            <CSVUpload onUpload={handleCSVUpload} />
            <FileUploadLog uploadLog={uploadLog} />
          </>
        )}

        {currentView === "scanner" && (
          <div className="scanner-layout">
            <StockTable
              data={stockData}
              onAcceptEntry={handleAcceptEntry}
              onRejectEntry={handleRejectEntry}
              onFlagEntry={handleFlagEntry}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
