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
  const [slingshotData, setSlingshotData] = useState([]);
  const [uploadLog, setUploadLog] = useState([]);
  const [currentView, setCurrentView] = useState("upload");

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadDataFromLocalStorage();
    const savedSlingshotData = loadDataFromLocalStorage("slingshot");
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

      if (savedSlingshotData && savedSlingshotData.length > 0) {
        setSlingshotData(savedSlingshotData);
      }

      if (savedLog && savedLog.length > 0) {
        setUploadLog(savedLog);
      }
    }
  }, []);

  const handleCSVUpload = (uploadResult, stats) => {
    // Add status 'pending' to new entries
    const newDataWithStatus = uploadResult.regularData.map((item) => ({
      ...item,
      status: "pending",
    }));

    const newSlingshotDataWithStatus = uploadResult.slingshotData.map(
      (item) => ({
        ...item,
        status: "pending",
      })
    );

    // Merge with existing data
    const mergedData = [...stockData, ...newDataWithStatus];
    const mergedSlingshotData = [
      ...slingshotData,
      ...newSlingshotDataWithStatus,
    ];

    setStockData(mergedData);
    setSlingshotData(mergedSlingshotData);
    saveDataToLocalStorage(mergedData);
    saveDataToLocalStorage(mergedSlingshotData, "slingshot");

    // Save first upload time if this is the first upload
    if (stockData.length === 0 && slingshotData.length === 0) {
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

  const handleAcceptEntry = (symbol, category = "regular") => {
    if (category === "slingshot") {
      const updatedData = slingshotData.map((item) =>
        item.SYMBOL === symbol ? { ...item, status: "accepted" } : item
      );
      setSlingshotData(updatedData);
      saveDataToLocalStorage(updatedData, "slingshot");
    } else {
      const updatedData = stockData.map((item) =>
        item.SYMBOL === symbol ? { ...item, status: "accepted" } : item
      );
      setStockData(updatedData);
      saveDataToLocalStorage(updatedData);
    }
  };

  const handleRejectEntry = (symbol, category = "regular") => {
    if (category === "slingshot") {
      const updatedData = slingshotData.map((item) =>
        item.SYMBOL === symbol ? { ...item, status: "rejected" } : item
      );
      setSlingshotData(updatedData);
      saveDataToLocalStorage(updatedData, "slingshot");
    } else {
      const updatedData = stockData.map((item) =>
        item.SYMBOL === symbol ? { ...item, status: "rejected" } : item
      );
      setStockData(updatedData);
      saveDataToLocalStorage(updatedData);
    }
  };

  const handleFlagEntry = (symbol, category = "regular") => {
    if (category === "slingshot") {
      const updatedData = slingshotData.map((item) =>
        item.SYMBOL === symbol ? { ...item, status: "no setup" } : item
      );
      setSlingshotData(updatedData);
      saveDataToLocalStorage(updatedData, "slingshot");
    } else {
      const updatedData = stockData.map((item) =>
        item.SYMBOL === symbol ? { ...item, status: "no setup" } : item
      );
      setStockData(updatedData);
      saveDataToLocalStorage(updatedData);
    }
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all data?\n\nThis will permanently delete:\n• All uploaded stock data\n• File upload history\n• All strategy evaluations and scores\n\nThis action cannot be undone."
    );

    if (confirmed) {
      clearLocalStorage();
      setStockData([]);
      setSlingshotData([]);
      setUploadLog([]);
      setCurrentView("upload");
    }
  };

  return (
    <div className="app">
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        dataCount={stockData.length + slingshotData.length}
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
              slingshotData={slingshotData}
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
