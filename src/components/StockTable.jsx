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
import StrategyEvaluationPopup from "./StrategyEvaluationPopup";
import {
  formatVolume,
  formatTimeOnly,
  getRowClassName,
  handleOpenCharts,
} from "../utils/stockTableUtils";

const ITEMS_PER_PAGE = 50;

const StockTable = ({
  data,
  slingshotData,
  onAcceptEntry,
  onRejectEntry,
  onFlagEntry,
}) => {
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
  const [activeTable, setActiveTable] = useState("regular"); // 'regular' or 'slingshot'
  const [showRejected, setShowRejected] = useState(false);
  const [strategyPopup, setStrategyPopup] = useState({
    isOpen: false,
    symbol: null,
  });
  const [strategyScores, setStrategyScores] = useState({});
  const [scoreUpdateTrigger, setScoreUpdateTrigger] = useState(0);
  const tableRef = useRef(null);

  // Handle flag entry for "no setup" status
  const handleFlagEntry = (symbol) => {
    // Determine which category based on active table
    const category = activeTable === "slingshot" ? "slingshot" : "regular";
    if (onFlagEntry) {
      onFlagEntry(symbol, category);
    }
  };

  // Handle score circle click
  const handleScoreClick = (symbol) => {
    setStrategyPopup({ isOpen: true, symbol });
  };

  // Handle strategy popup close
  const handleStrategyPopupClose = () => {
    setStrategyPopup({ isOpen: false, symbol: null });
  };

  // Handle score update from strategy evaluation
  const handleScoreUpdate = (symbol, strategy, percentage) => {
    setStrategyScores((prev) => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [strategy]: percentage,
      },
    }));
    // Trigger re-render of ScoreCircle components
    setScoreUpdateTrigger((prev) => prev + 1);
  };

  // Listen for table toggle
  useEffect(() => {
    const handler = () =>
      setActiveTable((prev) => (prev === "regular" ? "slingshot" : "regular"));
    window.addEventListener("table-toggle", handler);
    return () => window.removeEventListener("table-toggle", handler);
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

  // Get current dataset based on active table
  const currentData = activeTable === "slingshot" ? slingshotData : data;

  // Separate data by status for proper ordering
  const { pendingData, acceptedData, flaggedData, rejectedData } =
    useMemo(() => {
      const pending = currentData.filter(
        (item) => !item.status || item.status === "pending"
      );
      const accepted = currentData.filter((item) => item.status === "accepted");
      const flagged = currentData.filter((item) => item.status === "no setup");
      const rejected = currentData.filter((item) => item.status === "rejected");
      return {
        pendingData: pending,
        acceptedData: accepted,
        flaggedData: flagged,
        rejectedData: rejected,
      };
    }, [currentData]);

  // Filter non-rejected data based on search term and column filters
  const filteredNonRejectedData = useMemo(() => {
    let filtered = [...pendingData, ...acceptedData, ...flaggedData];

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
  }, [pendingData, acceptedData, flaggedData, searchTerm, columnFilters]);

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

  // Combine sorted data with rejected data (rejected always at bottom)
  const combinedData = useMemo(() => {
    if (showRejected) {
      return rejectedData;
    }
    return sortedNonRejectedData;
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
    setActiveTable((prev) => (prev === "regular" ? "slingshot" : "regular"));
  };

  const handleOpenChartsClick = () => {
    handleOpenCharts(currentData);
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

  if (data.length === 0 && slingshotData.length === 0) {
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
        <h2>
          {activeTable === "slingshot" ? "Slingshot Scanner" : "Stock Scanner"}(
          {pendingData.length + acceptedData.length})
        </h2>
        <button
          className="slingshot-toggle-button"
          onClick={handleSlingshotToggle}
          style={{
            background: activeTable === "slingshot" ? "#7c3aed" : "#374151",
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
            boxShadow:
              activeTable === "slingshot"
                ? "0 2px 8px rgba(124,62,237,0.3)"
                : "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          title={
            activeTable === "slingshot"
              ? "Switch to Regular Table"
              : "Switch to Slingshot Table"
          }
        >
          🚀 {activeTable === "slingshot" ? "Regular" : "Slingshot"}
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
          title="Open TradingView charts for all pending stocks"
        >
          📊 Charts
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
                key={`${row.SYMBOL}-${index}-${scoreUpdateTrigger}`}
                row={row}
                index={index}
                isMobile={isMobile}
                slingshotActive={activeTable === "slingshot"}
                onAcceptEntry={(symbol) =>
                  onAcceptEntry(
                    symbol,
                    activeTable === "slingshot" ? "slingshot" : "regular"
                  )
                }
                onRejectEntry={(symbol) =>
                  onRejectEntry(
                    symbol,
                    activeTable === "slingshot" ? "slingshot" : "regular"
                  )
                }
                onFlagEntry={handleFlagEntry}
                onScoreClick={handleScoreClick}
                scoreUpdateTrigger={scoreUpdateTrigger}
                getRowClassName={(row) =>
                  getRowClassName(row, activeTable === "slingshot")
                }
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

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          className="rejected-toggle-button"
          onClick={() => setShowRejected(!showRejected)}
          style={{
            background: showRejected ? "#dc2626" : "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.9em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          title={showRejected ? "Show Active Stocks" : "Show Rejected Stocks"}
        >
          {showRejected
            ? "← Back to Active"
            : `🗑️ View Rejected (${rejectedData.length})`}
        </button>
      </div>

      {/* Data Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
          gap: "20px",
          fontSize: "0.9em",
          color: "#6b7280",
        }}
      >
        <span>Regular Stocks: {data.length}</span>
        <span>Slingshot Stocks: {slingshotData.length}</span>
        <span>Total: {data.length + slingshotData.length}</span>
      </div>

      <StrategyEvaluationPopup
        symbol={strategyPopup.symbol}
        isOpen={strategyPopup.isOpen}
        onClose={handleStrategyPopupClose}
        onScoreUpdate={handleScoreUpdate}
      />
    </div>
  );
};

export default StockTable;
