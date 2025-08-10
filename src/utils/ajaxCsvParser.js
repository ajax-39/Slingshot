// CSV parsing utility for Ajax format with different column names

import Papa from "papaparse";
import { getCurrentISTDateTime } from "./dateUtils";
import { loadDataFromLocalStorage } from "./localStorage";

const AJAX_REQUIRED_COLUMNS = ["Symbol", "% Chg", "Price", "Volume"];

export const parseAjaxCSVFile = (file, fileName) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const validatedData = validateAndProcessAjaxData(
            results.data,
            fileName
          );
          resolve(validatedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
};

const validateAndProcessAjaxData = (data, fileName) => {
  if (!data || data.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Get existing stock symbols for duplicate checking (case-insensitive)
  const existingData = loadDataFromLocalStorage();
  const existingSymbols = new Set(
    existingData.map((stock) => stock.SYMBOL.toUpperCase())
  );

  // Check if required columns exist by finding them in the header row
  const firstRow = data[0];
  const availableColumns = Object.keys(firstRow);

  console.log(
    "Available columns:",
    availableColumns.map((col) => `"${col}"`)
  );

  // Find columns by name (case-insensitive and flexible matching)
  const columnMapping = {};

  AJAX_REQUIRED_COLUMNS.forEach((requiredCol) => {
    const foundColumn = availableColumns.find((col) => {
      // Clean both column names - remove whitespace, newlines, and normalize
      const cleanCol = col.replace(/\s+/g, " ").trim();
      const cleanRequired = requiredCol.replace(/\s+/g, " ").trim();

      // Exact match first (case-sensitive for better precision)
      if (cleanCol === cleanRequired) return true;

      // Case-insensitive exact match
      if (cleanCol.toLowerCase() === cleanRequired.toLowerCase()) return true;

      // For Symbol, accept variations like 'symbol', 'stock', 'ticker'
      if (requiredCol === "Symbol") {
        const lowerCol = cleanCol.toLowerCase();
        return (
          lowerCol === "symbol" ||
          lowerCol === "stock" ||
          lowerCol === "ticker" ||
          lowerCol.includes("symbol")
        );
      }

      // For % Chg, be very specific about the format
      if (requiredCol === "% Chg") {
        const lowerCol = cleanCol.toLowerCase();
        return (
          lowerCol === "% chg" ||
          lowerCol === "%chg" ||
          lowerCol === "chg" ||
          lowerCol === "change" ||
          lowerCol === "% change" ||
          lowerCol === "%change"
        );
      }

      // For Price, accept variations
      if (requiredCol === "Price") {
        const lowerCol = cleanCol.toLowerCase();
        return (
          lowerCol === "price" ||
          lowerCol === "ltp" ||
          lowerCol === "last price" ||
          lowerCol === "close" ||
          lowerCol === "close price"
        );
      }

      // For Volume, be specific
      if (requiredCol === "Volume") {
        const lowerCol = cleanCol.toLowerCase();
        return (
          lowerCol === "volume" ||
          lowerCol === "vol" ||
          lowerCol.includes("volume")
        );
      }

      return false;
    });

    if (foundColumn) {
      columnMapping[requiredCol] = foundColumn;
    }
  });

  const missingColumns = AJAX_REQUIRED_COLUMNS.filter(
    (col) => !columnMapping[col]
  );

  console.log("Ajax Column mapping:", columnMapping);

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(
        ", "
      )}. Available columns: ${availableColumns.join(", ")}`
    );
  }

  // Process and validate each row
  const currentDateTime = getCurrentISTDateTime();
  const processedData = [];
  const skippedDuplicates = [];
  let skippedCount = 0;

  data.forEach((row, index) => {
    // Skip rows with missing required data using mapped column names
    const hasAllRequiredData = AJAX_REQUIRED_COLUMNS.every((col) => {
      const actualColumnName = columnMapping[col];
      return (
        row[actualColumnName] !== undefined &&
        row[actualColumnName] !== null &&
        row[actualColumnName].toString().trim() !== ""
      );
    });

    if (!hasAllRequiredData) {
      console.warn(`Skipping row ${index + 1}: Missing required data`);
      return;
    }

    // Extract values using mapped column names
    const symbolValue = row[columnMapping["Symbol"]];
    const priceValue = row[columnMapping["Price"]];
    const changeValue = row[columnMapping["% Chg"]];
    const volumeValue = row[columnMapping["Volume"]];

    // Check for duplicate symbols (case-insensitive)
    const symbolUpper = symbolValue.toString().trim().toUpperCase();
    if (existingSymbols.has(symbolUpper)) {
      skippedDuplicates.push(symbolUpper);
      skippedCount++;
      console.warn(
        `Skipping row ${index + 1}: Duplicate symbol ${symbolUpper}`
      );
      return;
    }

    // Parse and validate numeric fields
    const parsedPrice = parseFloat(priceValue);

    // Handle percentage values - remove % symbol if present
    const cleanedChange = changeValue.toString().replace("%", "").trim();
    const parsedChange = parseFloat(cleanedChange);

    // Parse volume - remove commas and convert to number
    // Handle different comma formats like "3,36,470" or "336,470"
    const cleanedVolume = volumeValue.toString().replace(/,/g, "").trim();
    const parsedVolume = parseFloat(cleanedVolume);

    // Only check if the values are valid numbers, no filtering constraints
    if (isNaN(parsedPrice) || isNaN(parsedChange) || isNaN(parsedVolume)) {
      console.warn(
        `Skipping row ${
          index + 1
        }: Invalid numeric data - Price: ${priceValue}, Change: ${changeValue}, Volume: ${volumeValue}`
      );
      return;
    }

    // Create processed row mapped to existing structure
    const processedRow = {
      SYMBOL: symbolUpper,
      LTP: parsedPrice, // Map Price to LTP
      "%CHNG": parsedChange, // Map % Chg to %CHNG
      "VOLUME (shares)": parsedVolume, // Map Volume to VOLUME (shares)
      "Upload Date & Time": currentDateTime,
    };

    processedData.push(processedRow);
    // Add to existing symbols set for subsequent rows in the same file
    existingSymbols.add(symbolUpper);
  });

  if (processedData.length === 0) {
    if (skippedCount > 0) {
      throw new Error(`No valid data rows found in CSV file. All ${skippedCount} rows were skipped due to missing/invalid data or duplicates.`);
    } else {
      throw new Error("No valid data rows found in CSV file");
    }
  }

  // Return both processed data and statistics
  // Ensure new entries are shown at the top
  return {
    data: processedData.reverse(),
    stats: {
      fileName: fileName || "Unknown",
      totalRows: data.length,
      addedCount: processedData.length,
      skippedCount: skippedCount,
      skippedDuplicates: skippedDuplicates,
      timestamp: currentDateTime,
    },
  };
};
