import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 50;

const StockTable = ({ data, onAcceptEntry, onRejectEntry, onFlagEntry }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "%CHNG",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(null);
  const [columnFilters, setColumnFilters] = useState({
    SYMBOL: "",
    LTP: "all",
    "%CHNG": "all",
    "VOLUME (shares)": "all",
    "Upload Date & Time": "all",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [slingshotActive, setSlingshotActive] = useState(false);
  const tableRef = useRef(null);

  // Handle flag entry for "no setup" status
  const handleFlagEntry = (symbol) => {
    // This will be passed up to parent component to update the entry status
    if (onFlagEntry) {
      onFlagEntry(symbol);
    }
  };

  // Listen for slingshot filter toggle
  useEffect(() => {
    const handler = () => setSlingshotActive((prev) => !prev);
    window.addEventListener("slingshot-filter-toggle", handler);
    return () => window.removeEventListener("slingshot-filter-toggle", handler);
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setActiveFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Separate data by status for proper ordering
  const { pendingData, acceptedData, flaggedData, rejectedData } = useMemo(() => {
    const pending = data.filter((item) => !item.status || item.status === "pending");
    const accepted = data.filter((item) => item.status === "accepted");
    const flagged = data.filter((item) => item.status === "no setup");
    const rejected = data.filter((item) => item.status === "rejected");
    return { pendingData: pending, acceptedData: accepted, flaggedData: flagged, rejectedData: rejected };
  }, [data]);

  // Filter non-rejected data based on search term and column filters
  const filteredNonRejectedData = useMemo(() => {
    let filtered = [...pendingData, ...acceptedData, ...flaggedData];

    // Slingshot filter logic
    if (slingshotActive) {
      filtered = filtered.filter((item) => {
        const ltp = parseFloat(item.LTP);
        const vol = parseFloat(item["VOLUME (shares)"]);
        const chng = parseFloat(item["%CHNG"]);
        return ltp >= 100 && ltp <= 3000 && vol >= 1000000 && chng > 3;
      });
    }

    // Global search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Column filters
    if (columnFilters.SYMBOL) {
      filtered = filtered.filter((item) =>
        item.SYMBOL.toLowerCase().includes(columnFilters.SYMBOL.toLowerCase())
      );
    }

    if (columnFilters.LTP === "range_100_3000") {
      filtered = filtered.filter((item) => {
        const ltp = parseFloat(item.LTP);
        return ltp >= 100 && ltp <= 3000;
      });
    }

    return filtered;
  }, [pendingData, acceptedData, flaggedData, searchTerm, columnFilters, slingshotActive]);

  // Sort non-rejected data
  const sortedNonRejectedData = useMemo(() => {
    let dataToSort = filteredNonRejectedData;

    // Apply column filter sorting
    if (columnFilters.LTP === "asc" || columnFilters.LTP === "desc") {
      dataToSort = [...dataToSort].sort((a, b) => {
        const aNum = parseFloat(a.LTP);
        const bNum = parseFloat(b.LTP);
        return columnFilters.LTP === "asc" ? aNum - bNum : bNum - aNum;
      });
    } else if (
      columnFilters["%CHNG"] === "asc" ||
      columnFilters["%CHNG"] === "desc"
    ) {
      dataToSort = [...dataToSort].sort((a, b) => {
        const aNum = parseFloat(a["%CHNG"]);
        const bNum = parseFloat(b["%CHNG"]);
        return columnFilters["%CHNG"] === "asc" ? aNum - bNum : bNum - aNum;
      });
    } else if (
      columnFilters["VOLUME (shares)"] === "asc" ||
      columnFilters["VOLUME (shares)"] === "desc"
    ) {
      dataToSort = [...dataToSort].sort((a, b) => {
        const aNum = parseInt(a["VOLUME (shares)"]);
        const bNum = parseInt(b["VOLUME (shares)"]);
        return columnFilters["VOLUME (shares)"] === "asc"
          ? aNum - bNum
          : bNum - aNum;
      });
    } else if (
      columnFilters["Upload Date & Time"] === "asc" ||
      columnFilters["Upload Date & Time"] === "desc"
    ) {
      dataToSort = [...dataToSort].sort((a, b) => {
        const aDate = new Date(
          a["Upload Date & Time"].split(" ")[0].split("-").reverse().join("-")
        );
        const bDate = new Date(
          b["Upload Date & Time"].split(" ")[0].split("-").reverse().join("-")
        );
        return columnFilters["Upload Date & Time"] === "asc"
          ? aDate - bDate
          : bDate - aDate;
      });
    }

    // Apply manual sorting if no column filter is active
    if (!sortConfig.key) {
      // Sort by status priority: pending (new entries) first, then accepted, then flagged
      return [...dataToSort].sort((a, b) => {
        const aStatus = a.status || "pending";
        const bStatus = b.status || "pending";
        
        const statusPriority = { "pending": 0, "accepted": 1, "no setup": 2 };
        return statusPriority[aStatus] - statusPriority[bStatus];
      });
    }

    return [...dataToSort].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle numeric columns
      if (
        sortConfig.key === "LTP" ||
        sortConfig.key === "%CHNG" ||
        sortConfig.key === "VOLUME (shares)"
      ) {
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Handle string columns
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredNonRejectedData, sortConfig, columnFilters]);

  // Combine sorted data with rejected data (rejected always at bottom)
  const combinedData = useMemo(() => {
    return [...sortedNonRejectedData, ...rejectedData];
  }, [sortedNonRejectedData, rejectedData]);

  // Paginate combined data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return combinedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [combinedData, currentPage]);

  const totalPages = Math.ceil(combinedData.length / ITEMS_PER_PAGE);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleColumnFilter = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setCurrentPage(1);
    setActiveFilter(null);
  };

  const toggleFilter = (column) => {
    setActiveFilter(activeFilter === column ? null : column);
  };

  const getRowClassName = (row) => {
    if (slingshotActive) {
      const ltp = parseFloat(row.LTP);
      const vol = parseFloat(row["VOLUME (shares)"]);
      const chng = parseFloat(row["%CHNG"]);
      const isSlingshot =
        ltp >= 100 && ltp <= 3000 && vol >= 1000000 && chng > 3;
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

  const formatChangeValue = (change) => {
    const value = parseFloat(change);
    const className =
      value > 0
        ? "positive-change"
        : value < 0
        ? "negative-change"
        : "zero-change";
    const prefix = value > 0 ? "+" : "";
    return (
      <span className={className}>
        {prefix}
        {value.toFixed(2)}%
      </span>
    );
  };

  const formatVolume = (volume) => {
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

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const renderFilterDropdown = (column) => {
    if (activeFilter !== column) return null;

    if (column === "SYMBOL") {
      return (
        <div className="filter-dropdown">
          <div className="filter-header">
            <span>Search Symbol</span>
            <button
              className="close-filter"
              onClick={() => setActiveFilter(null)}
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="Search symbol..."
            value={columnFilters.SYMBOL}
            onChange={(e) => handleColumnFilter("SYMBOL", e.target.value)}
            className="filter-input"
          />
        </div>
      );
    }

    if (column === "LTP") {
      return (
        <div className="filter-dropdown">
          <div className="filter-header">
            <span>LTP Options</span>
            <button
              className="close-filter"
              onClick={() => setActiveFilter(null)}
            >
              ×
            </button>
          </div>
          <div
            className="filter-option"
            onClick={() => handleColumnFilter("LTP", "all")}
          >
            All
          </div>
          <div
            className="filter-option"
            onClick={() => handleColumnFilter("LTP", "asc")}
          >
            Sort Ascending
          </div>
          <div
            className="filter-option"
            onClick={() => handleColumnFilter("LTP", "desc")}
          >
            Sort Descending
          </div>
          <div
            className="filter-option"
            onClick={() => handleColumnFilter("LTP", "range_100_3000")}
          >
            Range 100-3000
          </div>
        </div>
      );
    }

    // For %CHNG, VOLUME, Upload Time - only sorting options
    return (
      <div className="filter-dropdown">
        <div className="filter-header">
          <span>{column} Options</span>
          <button
            className="close-filter"
            onClick={() => setActiveFilter(null)}
          >
            ×
          </button>
        </div>
        <div
          className="filter-option"
          onClick={() => handleColumnFilter(column, "all")}
        >
          All
        </div>
        <div
          className="filter-option"
          onClick={() => handleColumnFilter(column, "asc")}
        >
          Sort Ascending
        </div>
        <div
          className="filter-option"
          onClick={() => handleColumnFilter(column, "desc")}
        >
          Sort Descending
        </div>
      </div>
    );
  };

  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    // Expecting format: DD-MM-YYYY HH:mm:ss
    const timePart = dateTimeStr.split(" ")[1];
    if (!timePart) return "";
    let [hour, minute] = timePart.split(":");
    hour = parseInt(hour);
    const ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12;
    if (hour === 0) hour = 12; // Convert 0 to 12 for 12am
    return `${hour}:${minute} ${ampm}`;
  };

  if (data.length === 0) {
    return (
      <div className="stock-table-container">
        <div className="text-center" style={{ padding: "40px" }}>
          <p>No stock data available. Please upload a CSV file first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-table-container" ref={tableRef}>
      <div className="table-header">
        <h2>Stock Scanner</h2>
        <div
          className="search-container"
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* Slingshot filter indicator */}
          <span
            style={{
              display: slingshotActive ? "inline-block" : "none",
              background: "#7c3aed",
              color: "#fff",
              borderRadius: "6px",
              padding: "4px 10px",
              marginRight: "10px",
              fontWeight: "bold",
              fontSize: "0.95em",
              boxShadow: "0 1px 4px rgba(124,62,237,0.15)",
            }}
          >
            🚀 Slingshot Active
          </span>
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      <div
        className="table-wrapper"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          ...(isMobile
            ? {
                maxWidth: "100vw",
                scrollbarWidth: "thin",
              }
            : {}),
        }}
      >
        <table
          className="data-table"
          style={{
            ...(isMobile
              ? {
                  minWidth: "auto", // Let content determine width
                  width: "100%",
                }
              : {}),
          }}
        >
          <thead>
            <tr>
              <th className="column-header">
                <div className="column-header-content">
                  <span onClick={() => handleSort("SYMBOL")}>
                    SYMBOL {getSortIcon("SYMBOL")}
                  </span>
                  <button
                    className="filter-button"
                    onClick={() => toggleFilter("SYMBOL")}
                  >
                    <Filter size={14} />
                  </button>
                </div>
                {renderFilterDropdown("SYMBOL")}
              </th>
              <th className="column-header">
                <div className="column-header-content">
                  <span onClick={() => handleSort("%CHNG")}>
                    %CHNG {getSortIcon("%CHNG")}
                  </span>
                  <button
                    className="filter-button"
                    onClick={() => toggleFilter("%CHNG")}
                  >
                    <Filter size={14} />
                  </button>
                </div>
                {renderFilterDropdown("%CHNG")}
              </th>
              {isMobile && <th className="actions-column">ACTIONS</th>}
              <th className="column-header">
                <div className="column-header-content">
                  <span onClick={() => handleSort("LTP")}>
                    LTP {getSortIcon("LTP")}
                  </span>
                  <button
                    className="filter-button"
                    onClick={() => toggleFilter("LTP")}
                  >
                    <Filter size={14} />
                  </button>
                </div>
                {renderFilterDropdown("LTP")}
              </th>
              {!isMobile && <th className="actions-column">ACTIONS</th>}
              <th className="column-header">
                <div className="column-header-content">
                  <span onClick={() => handleSort("Upload Date & Time")}>
                    TIME {getSortIcon("Upload Date & Time")}
                  </span>
                  <button
                    className="filter-button"
                    onClick={() => toggleFilter("Upload Date & Time")}
                  >
                    <Filter size={14} />
                  </button>
                </div>
                {renderFilterDropdown("Upload Date & Time")}
              </th>
              {!isMobile && (
                <th className="column-header">
                  <div className="column-header-content">
                    <span onClick={() => handleSort("VOLUME (shares)")}>
                      VOL {getSortIcon("VOLUME (shares)")}
                    </span>
                    <button
                      className="filter-button"
                      onClick={() => toggleFilter("VOLUME (shares)")}
                    >
                      <Filter size={14} />
                    </button>
                  </div>
                  {renderFilterDropdown("VOLUME (shares)")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              // Slingshot filter match
              const ltp = parseFloat(row.LTP);
              const vol = parseFloat(row["VOLUME (shares)"]);
              const chng = parseFloat(row["%CHNG"]);
              const isSlingshot =
                slingshotActive &&
                ltp >= 100 &&
                ltp <= 3000 &&
                vol >= 1000000 &&
                chng > 3;
              return (
                <tr
                  key={`${row.SYMBOL}-${index}`}
                  className={getRowClassName(row)}
                >
                  <td className="symbol-cell">
                    {row.SYMBOL}
                    {isSlingshot && (
                      <span
                        style={{
                          marginLeft: 6,
                          padding: "2px 8px",
                          borderRadius: "8px",
                          background:
                            row.status === "accepted"
                              ? "#ec4899"
                              : row.status === "rejected"
                              ? "#ef4444"
                              : row.status === "no setup"
                              ? "#ec4899"
                              : "#7c3aed",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "0.8em",
                          boxShadow: "0 1px 4px rgba(124,62,237,0.10)",
                          verticalAlign: "middle",
                          display: "inline-block",
                        }}
                      >
                        🚀 Slingshot
                      </span>
                    )}
                  </td>
                  <td>{formatChangeValue(row["%CHNG"])}</td>
                  {isMobile && (
                    <td className="actions-cell">
                      {row.status !== "rejected" &&
                        row.status !== "accepted" &&
                        row.status !== "no setup" && (
                          <div
                            className="action-buttons"
                            style={{
                              display: "flex",
                              gap: "3px",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                            }}
                          >
                            <button
                              className="accept-button"
                              style={{
                                minWidth: 24,
                                minHeight: 24,
                                fontSize: 12,
                                borderRadius: 4,
                                border: "none",
                                background: "#4ade80",
                                color: "#000",
                                cursor: "pointer",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "2px",
                              }}
                              onClick={() => onAcceptEntry(row.SYMBOL)}
                              title="Accept"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              className="reject-button"
                              style={{
                                minWidth: 24,
                                minHeight: 24,
                                fontSize: 12,
                                borderRadius: 4,
                                border: "none",
                                background: "#f87171",
                                color: "#000",
                                cursor: "pointer",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "2px",
                              }}
                              onClick={() => onRejectEntry(row.SYMBOL)}
                              title="Reject"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      {row.status === "accepted" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "3px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="status-indicator accepted"
                            style={{ fontSize: "14px" }}
                          >
                            ✓
                          </span>
                          <button
                            className="flag-button"
                            style={{
                              minWidth: 24,
                              minHeight: 24,
                              fontSize: 12,
                              borderRadius: 4,
                              border: "none",
                              background: "#ec4899",
                              color: "#fff",
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "2px",
                            }}
                            onClick={() => handleFlagEntry(row.SYMBOL)}
                            title="No Setup"
                          >
                            🚫
                          </button>
                        </div>
                      )}
                      {row.status === "no setup" && (
                        <span
                          className="status-indicator flagged"
                          style={{ fontSize: "14px", color: "#ec4899" }}
                        >
                          🚫
                        </span>
                      )}
                      {row.status === "rejected" && (
                        <span
                          className="status-indicator rejected"
                          style={{ fontSize: "14px" }}
                        >
                          ✗
                        </span>
                      )}
                    </td>
                  )}
                  <td>₹{parseFloat(row.LTP).toFixed(2)}</td>
                  {!isMobile && (
                    <td
                      className="actions-cell"
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {row.status !== "rejected" &&
                        row.status !== "accepted" &&
                        row.status !== "no setup" && (
                          <div
                            className="action-buttons"
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                            }}
                          >
                            <button
                              className="accept-button"
                              style={{
                                minWidth: 36,
                                minHeight: 36,
                                fontSize: 16,
                                borderRadius: 6,
                                border: "none",
                                background: "#4ade80",
                                color: "#000",
                                cursor: "pointer",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onClick={() => onAcceptEntry(row.SYMBOL)}
                              title="Accept"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              className="reject-button"
                              style={{
                                minWidth: 36,
                                minHeight: 36,
                                fontSize: 16,
                                borderRadius: 6,
                                border: "none",
                                background: "#f87171",
                                color: "#000",
                                cursor: "pointer",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onClick={() => onRejectEntry(row.SYMBOL)}
                              title="Reject"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      {row.status === "accepted" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="status-indicator accepted"
                            style={{ fontSize: "18px" }}
                          >
                            ✓
                          </span>
                          <button
                            className="flag-button"
                            style={{
                              minWidth: 36,
                              minHeight: 36,
                              fontSize: 16,
                              borderRadius: 6,
                              border: "none",
                              background: "#ec4899",
                              color: "#fff",
                              cursor: "pointer",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => handleFlagEntry(row.SYMBOL)}
                            title="No Setup"
                          >
                            🚫
                          </button>
                        </div>
                      )}
                      {row.status === "no setup" && (
                        <span
                          className="status-indicator flagged"
                          style={{ fontSize: "18px", color: "#ec4899" }}
                        >
                          🚫
                        </span>
                      )}
                      {row.status === "rejected" && (
                        <span
                          className="status-indicator rejected"
                          style={{ fontSize: "18px" }}
                        >
                          ✗
                        </span>
                      )}
                    </td>
                  )}
                  <td className="upload-time-cell">
                    {formatTimeOnly(row["Upload Date & Time"])}
                  </td>
                  {!isMobile && <td>{formatVolume(row["VOLUME (shares)"])}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({combinedData.length} records)
          </span>

          <button
            className="pagination-button"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StockTable;
