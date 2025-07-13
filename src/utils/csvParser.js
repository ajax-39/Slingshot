// CSV parsing utility functions using PapaParse

import Papa from "papaparse";
import { getCurrentISTDateTime } from "./dateUtils";
import { loadDataFromLocalStorage } from "./localStorage";

const REQUIRED_COLUMNS = ["SYMBOL", "LTP", "%CHNG", "VOLUME (shares)"];

export const parseCSVFile = (file, fileName) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const validatedData = validateAndProcessData(results.data, fileName);
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

const validateAndProcessData = (data, fileName) => {
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

  REQUIRED_COLUMNS.forEach((requiredCol) => {
    const foundColumn = availableColumns.find((col) => {
      // Clean both column names - remove whitespace, newlines, and normalize
      const cleanCol = col.replace(/\s+/g, " ").trim().toLowerCase();
      const cleanRequired = requiredCol
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      // Direct match
      if (cleanCol === cleanRequired) return true;

      // For VOLUME (shares), also check for variations
      if (requiredCol === "VOLUME (shares)") {
        return cleanCol.includes("volume") && cleanCol.includes("shares");
      }

      // For other columns, check if the column contains the required text
      return cleanCol.includes(cleanRequired.replace(/[()]/g, "").trim());
    });

    if (foundColumn) {
      columnMapping[requiredCol] = foundColumn;
    }
  });

  const missingColumns = REQUIRED_COLUMNS.filter((col) => !columnMapping[col]);

  console.log("Column mapping:", columnMapping);

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
    const hasAllRequiredData = REQUIRED_COLUMNS.every((col) => {
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
    const symbolValue = row[columnMapping["SYMBOL"]];
    const ltpValue = row[columnMapping["LTP"]];
    const changeValue = row[columnMapping["%CHNG"]];
    const volumeValue = row[columnMapping["VOLUME (shares)"]];

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
    const parsedLTP = parseFloat(ltpValue);
    const parsedChange = parseFloat(changeValue);

    // Parse volume - remove commas and convert to number
    const cleanedVolume = volumeValue.toString().replace(/,/g, "");
    const parsedVolume = parseFloat(cleanedVolume);

    if (isNaN(parsedLTP) || isNaN(parsedChange) || isNaN(parsedVolume)) {
      console.warn(
        `Skipping row ${
          index + 1
        }: Invalid numeric data - LTP: ${ltpValue}, %CHNG: ${changeValue}, VOLUME: ${volumeValue}`
      );
      return;
    }

    // Create processed row with only required columns plus timestamp
    const processedRow = {
      SYMBOL: symbolUpper,
      LTP: parsedLTP,
      "%CHNG": parsedChange,
      "VOLUME (shares)": parsedVolume,
      "Upload Date & Time": currentDateTime,
    };

    processedData.push(processedRow);
    // Add to existing symbols set for subsequent rows in the same file
    existingSymbols.add(symbolUpper);
  });

  if (processedData.length === 0 && skippedCount === 0) {
    throw new Error("No valid data rows found in CSV file");
  }

  // Return both processed data and statistics
  return {
    data: processedData,
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
