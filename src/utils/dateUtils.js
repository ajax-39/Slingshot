// Date utility functions for Ajax app

export const getCurrentISTDateTime = () => {
  const now = new Date();

  // Format as DD-MM-YYYY HH:MM:SS AM/PM using current system time
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  // Convert to 12-hour format
  let hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = String(hours).padStart(2, "0");

  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

export const formatDateForInput = (dateString) => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for input[type="date"]
  if (!dateString) return "";

  const parts = dateString.split(" ")[0].split("-");
  if (parts.length !== 3) return "";

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

// Check if data is older than 24 hours based on first upload time
export const isDataExpired = (firstUploadTime) => {
  if (!firstUploadTime) return false;

  const firstUpload = new Date(
    firstUploadTime.split(" ")[0].split("-").reverse().join("-") +
      " " +
      firstUploadTime.split(" ").slice(1).join(" ")
  );
  const now = new Date();
  const diffHours = (now - firstUpload) / (1000 * 60 * 60);

  return diffHours > 24;
};

// Get timestamp for comparison
export const getTimestamp = () => {
  return Date.now();
};
