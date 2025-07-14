// Utility functions for stock table operations

export const formatChangeValue = (change) => {
  const value = parseFloat(change);
  const className =
    value > 0
      ? "positive-change"
      : value < 0
      ? "negative-change"
      : "zero-change";
  const prefix = value > 0 ? "+" : "";
  return {
    value: `${prefix}${value.toFixed(2)}%`,
    className: className,
  };
};

export const formatVolume = (volume) => {
  const num = parseInt(volume);
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

export const formatTimeOnly = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  // Expecting format: DD-MM-YYYY HH:mm:ss
  const timePart = dateTimeStr.split(" ")[1];
  if (!timePart) return "";
  let [hour, minute] = timePart.split(":");
  const originalHour = parseInt(hour);
  const ampm = originalHour >= 12 ? "pm" : "am";
  hour = originalHour % 12;
  if (hour === 0) hour = 12; // Convert 0 to 12 for 12am/12pm
  return `${hour}:${minute} ${ampm}`;
};

export const getRowClassName = (row, slingshotActive) => {
  if (slingshotActive) {
    const ltp = parseFloat(row.LTP);
    const vol = parseFloat(row["VOLUME (shares)"]);
    const chng = parseFloat(row["%CHNG"]);
    const isSlingshot = ltp >= 100 && ltp <= 3000 && vol >= 1000000 && chng > 3;
    if (isSlingshot) {
      if (row.status === "accepted") return "slingshot-accepted-row";
      if (row.status === "rejected") return "slingshot-rejected-row";
      if (row.status === "no setup") return "slingshot-flagged-row";
      return "slingshot-pending-row";
    }
  }
  if (row.status === "rejected") return "rejected-row";
  if (row.status === "accepted") return "accepted-row";
  if (row.status === "no setup") return "flagged-row";
  return "pending-row";
};

export const handleOpenCharts = (data) => {
  // Get all pending (yellow) stocks
  const pendingStocks = data.filter(
    (item) => !item.status || item.status === "pending"
  );

  if (pendingStocks.length === 0) {
    alert("No pending stocks found to open charts for.");
    return;
  }

  // Confirm with user before opening multiple tabs
  const confirmed = window.confirm(
    `This will open ${pendingStocks.length} chart tabs. Are you sure you want to continue?`
  );

  if (!confirmed) {
    return;
  }

  // Open TradingView chart for each pending stock with a small delay
  pendingStocks.forEach((stock, index) => {
    setTimeout(() => {
      const url = `https://www.tradingview.com/chart/NXBDGcbw/?symbol=NSE%3A${stock.SYMBOL}`;
      window.open(url, "_blank");
    }, index * 500); // 500ms delay between each tab opening
  });
};
