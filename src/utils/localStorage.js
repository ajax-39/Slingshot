// Local Storage utility functions for Ajax app

const STORAGE_KEY = "ajax_stock_data";
const FILE_LOG_KEY = "ajax_file_upload_log";
const FIRST_UPLOAD_KEY = "ajax_first_upload_time";

export const saveDataToLocalStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

export const loadDataFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return [];
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FILE_LOG_KEY);
    localStorage.removeItem(FIRST_UPLOAD_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
};

export const saveFileUploadLog = (fileLog) => {
  try {
    localStorage.setItem(FILE_LOG_KEY, JSON.stringify(fileLog));
  } catch (error) {
    console.error("Failed to save file upload log:", error);
  }
};

export const loadFileUploadLog = () => {
  try {
    const saved = localStorage.getItem(FILE_LOG_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load file upload log:", error);
    return [];
  }
};

export const addFileToUploadLog = (
  fileName,
  timestamp,
  addedCount,
  skippedCount
) => {
  try {
    const currentLog = loadFileUploadLog();
    const newEntry = {
      id: Date.now(),
      fileName,
      timestamp,
      addedCount,
      skippedCount,
      totalStocks: addedCount + skippedCount,
    };
    currentLog.push(newEntry);
    saveFileUploadLog(currentLog);
    return newEntry;
  } catch (error) {
    console.error("Failed to add file to upload log:", error);
    return null;
  }
};

export const saveFirstUploadTime = (time) => {
  try {
    localStorage.setItem(FIRST_UPLOAD_KEY, time);
  } catch (error) {
    console.error("Failed to save first upload time:", error);
  }
};

export const getFirstUploadTime = () => {
  try {
    return localStorage.getItem(FIRST_UPLOAD_KEY);
  } catch (error) {
    console.error("Failed to get first upload time:", error);
    return null;
  }
};
