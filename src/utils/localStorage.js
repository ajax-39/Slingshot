// Local Storage utility functions for Ajax app

const STORAGE_KEY = "ajax_stock_data";
const SLINGSHOT_STORAGE_KEY = "ajax_slingshot_data";
const FILE_LOG_KEY = "ajax_file_upload_log";
const FIRST_UPLOAD_KEY = "ajax_first_upload_time";

export const saveDataToLocalStorage = (data, category = "regular") => {
  try {
    const key = category === "slingshot" ? SLINGSHOT_STORAGE_KEY : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

export const loadDataFromLocalStorage = (category = "regular") => {
  try {
    const key = category === "slingshot" ? SLINGSHOT_STORAGE_KEY : STORAGE_KEY;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return [];
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SLINGSHOT_STORAGE_KEY);
    localStorage.removeItem(FILE_LOG_KEY);
    localStorage.removeItem(FIRST_UPLOAD_KEY);

    // Clear all strategy scores for all stocks
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("strategy_scores_")) {
        keysToRemove.push(key);
      }
    }

    // Remove all strategy score keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
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
