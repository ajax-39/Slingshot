import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import StockTableHeader from "./StockTableHeader";
import StockTableRow from "./StockTableRow";
import {
  formatVolume,
  formatTimeOnly,
  getRowClassName,
  handleOpenCharts,
} from "../utils/stockTableUtils";

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
  const [gainersActive, setGainersActive] = useState(false);
  const [losersActive, setLosersActive] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
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
  const { pendingData, acceptedData, flaggedData, rejectedData } =
    useMemo(() => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          pendingData: [],
          acceptedData: [],
          flaggedData: [],
          rejectedData: [],
        };
      }

      const pending = data.filter(
        (item) => !item.status || item.status === "pending"
      );
      const accepted = data.filter((item) => item.status === "accepted");
      const flagged = data.filter((item) => item.status === "no setup");
      const rejected = data.filter((item) => item.status === "rejected");
      return {
        pendingData: pending,
        acceptedData: accepted,
        flaggedData: flagged,
        rejectedData: rejected,
      };
    }, [data]);

  // Filter non-rejected data based on search term and column filters
  // Calculate counts for different filter categories
  const { slingshotCount, gainersCount, losersCount } = useMemo(() => {
    const allStocks = [...pendingData, ...acceptedData, ...flaggedData];

    let sCount = 0;
    let gCount = 0;
    let lCount = 0;

    allStocks.forEach((item) => {
      const ltp = parseFloat(item.LTP || 0);
      const vol = parseFloat(item["VOLUME (shares)"] || 0);
      const chng = parseFloat(item["%CHNG"] || 0);

      // Count slingshot stocks
      if (ltp >= 100 && ltp <= 3000 && vol >= 1000000 && chng > 3) {
        sCount++;
      }

      // Count gainers
      if (chng > 2) {
        gCount++;
      }

      // Count losers
      if (chng < -1) {
        lCount++;
      }
    });

    return {
      slingshotCount: sCount,
      gainersCount: gCount,
      losersCount: lCount,
    };
  }, [pendingData, acceptedData, flaggedData]);

  const filteredNonRejectedData = useMemo(() => {
    let filtered = [...pendingData, ...acceptedData, ...flaggedData]; // Slingshot filter logic
    if (slingshotActive) {
      filtered = filtered.filter((item) => {
        const ltp = parseFloat(item.LTP);
        const vol = parseFloat(item["VOLUME (shares)"]);
        const chng = parseFloat(item["%CHNG"]);
        return ltp >= 100 && ltp <= 3000 && vol >= 1000000 && chng > 3;
      });
    }

    // Gainers filter logic (only stocks >= +2% change)
    if (gainersActive) {
      filtered = filtered.filter((item) => {
        const chng = parseFloat(item["%CHNG"]);
        return chng >= 2;
      });
    }

    // Losers filter logic (only stocks <= -1% change)
    if (losersActive) {
      filtered = filtered.filter((item) => {
        const chng = parseFloat(item["%CHNG"]);
        return chng <= -1;
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
  }, [
    pendingData,
    acceptedData,
    flaggedData,
    searchTerm,
    columnFilters,
    slingshotActive,
    gainersActive,
    losersActive,
  ]);

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

        const statusPriority = { pending: 0, accepted: 1, "no setup": 2 };
        return statusPriority[aStatus] - statusPriority[bStatus];
      });
    }

    return [...dataToSort].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle status sorting (yellow->green->pink->red)
      if (sortConfig.key === "status") {
        const aStatus = a.status || "pending";
        const bStatus = b.status || "pending";

        const statusOrder = {
          pending: 0, // yellow
          accepted: 1, // green
          "no setup": 2, // pink
          rejected: 3, // red
        };

        return statusOrder[aStatus] - statusOrder[bStatus];
      }

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

  // Combine sorted data with rejected data (rejected only shown when toggled)
  const combinedData = useMemo(() => {
    return showRejected
      ? [...sortedNonRejectedData, ...rejectedData]
      : [...sortedNonRejectedData];
  }, [sortedNonRejectedData, rejectedData, showRejected]);

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

  const handleStatusSort = () => {
    setSortConfig({
      key: "status",
      direction: "asc",
    });
    setCurrentPage(1);
  };

  const handleSlingshotToggle = () => {
    setSlingshotActive((prev) => !prev);
    if (!slingshotActive) {
      setGainersActive(false);
      setLosersActive(false);
    }
  };

  const handleGainersToggle = () => {
    setGainersActive((prev) => !prev);
    if (!gainersActive) {
      setLosersActive(false);
      setSlingshotActive(false);
    }
  };

  const handleLosersToggle = () => {
    setLosersActive((prev) => !prev);
    if (!losersActive) {
      setGainersActive(false);
      setSlingshotActive(false);
    }
  };

  const handleToggleRejected = () => {
    setShowRejected((prev) => !prev);
    setCurrentPage(1); // Reset to first page when toggling rejected stocks
  };

  const handleOpenChartsClick = () => {
    // Only open charts for stocks that match the current active filter
    // and are pending (not already processed)
    if (!filteredNonRejectedData || filteredNonRejectedData.length === 0) {
      return; // No stocks to open charts for
    }

    const currentFilteredStocks = filteredNonRejectedData.filter(
      (row) => !row.status || row.status === "pending"
    );

    if (currentFilteredStocks.length > 0) {
      handleOpenCharts(currentFilteredStocks);
    }
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

  const toggleFilter = (column) => {
    setActiveFilter(activeFilter === column ? null : column);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
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
        <button
          className="slingshot-toggle-button"
          onClick={handleSlingshotToggle}
          style={{
            background: slingshotActive ? "#7c3aed" : "#374151",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: slingshotActive
              ? "0 2px 8px rgba(124,62,237,0.3)"
              : "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          title={
            slingshotActive
              ? "Disable Slingshot Filter"
              : "Enable Slingshot Filter"
          }
        >
          🚀 Slingshot{" "}
          <span className="filter-count">{`(${slingshotCount})`}</span>
        </button>
        <button
          className="gainers-button"
          onClick={handleGainersToggle}
          style={{
            background: gainersActive ? "#10b981" : "#374151",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: gainersActive
              ? "0 2px 8px rgba(16,185,129,0.3)"
              : "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          title={
            gainersActive
              ? "Disable Gainers Filter (>2%)"
              : "Enable Gainers Filter (>2%)"
          }
        >
          📈 Gainers <span className="filter-count">{`(${gainersCount})`}</span>
        </button>
        <button
          className="losers-button"
          onClick={handleLosersToggle}
          style={{
            background: losersActive ? "#ef4444" : "#374151",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: losersActive
              ? "0 2px 8px rgba(239,68,68,0.3)"
              : "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          title={
            losersActive
              ? "Disable Losers Filter (<-1%)"
              : "Enable Losers Filter (<-1%)"
          }
        >
          📉 Losers <span className="filter-count">{`(${losersCount})`}</span>
        </button>
        <button
          className="charts-button"
          onClick={handleOpenChartsClick}
          style={{
            background: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          title="Open TradingView charts for filtered pending stocks"
        >
          📊 Charts{" "}
          <span className="filter-count">{`(${
            filteredNonRejectedData?.filter(
              (row) => !row.status || row.status === "pending"
            )?.length || 0
          })`}</span>
        </button>
        <div
          className="search-container"
          style={{ display: "flex", alignItems: "center" }}
        >
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
          <StockTableHeader
            isMobile={isMobile}
            sortConfig={sortConfig}
            onSort={handleSort}
            onStatusSort={handleStatusSort}
            activeFilter={activeFilter}
            onToggleFilter={toggleFilter}
            onColumnFilter={handleColumnFilter}
            columnFilters={columnFilters}
            getSortIcon={getSortIcon}
          />
          <tbody>
            {paginatedData.map((row, index) => (
              <StockTableRow
                key={`${row.SYMBOL}-${index}`}
                row={row}
                index={index}
                isMobile={isMobile}
                slingshotActive={slingshotActive}
                onAcceptEntry={onAcceptEntry}
                onRejectEntry={onRejectEntry}
                onFlagEntry={onFlagEntry}
                getRowClassName={(row) => getRowClassName(row, slingshotActive)}
                formatChangeValue={formatChangeValue}
                formatTimeOnly={formatTimeOnly}
                formatVolume={formatVolume}
              />
            ))}
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

      <div className="rejected-stocks-toggle">
        <button
          onClick={handleToggleRejected}
          className="toggle-rejected-button"
          style={{
            background: showRejected ? "#ef4444" : "#374151",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            marginTop: "20px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
            width: "fit-content",
            margin: "20px auto 0",
          }}
        >
          {showRejected ? "Hide Rejected Stocks" : "Show Rejected Stocks"} (
          {rejectedData.length})
        </button>
      </div>
    </div>
  );
};

export default StockTable;
