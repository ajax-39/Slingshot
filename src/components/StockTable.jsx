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

const StockTable = ({ data, onAcceptEntry, onRejectEntry }) => {
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
  const tableRef = useRef(null);

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

  // Separate accepted/pending and rejected data
  const { acceptedData, rejectedData } = useMemo(() => {
    const accepted = data.filter((item) => item.status !== "rejected");
    const rejected = data.filter((item) => item.status === "rejected");
    return { acceptedData: accepted, rejectedData: rejected };
  }, [data]);

  // Filter accepted data based on search term and column filters
  const filteredAcceptedData = useMemo(() => {
    let filtered = acceptedData;

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
  }, [acceptedData, searchTerm, columnFilters]);

  // Sort accepted data
  const sortedAcceptedData = useMemo(() => {
    let dataToSort = filteredAcceptedData;

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
    if (!sortConfig.key) return dataToSort;

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
  }, [filteredAcceptedData, sortConfig, columnFilters]);

  // Combine sorted accepted data with rejected data (rejected always at bottom)
  const combinedData = useMemo(() => {
    return [...sortedAcceptedData, ...rejectedData];
  }, [sortedAcceptedData, rejectedData]);

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
    if (row.status === "rejected") return "rejected-row";
    if (row.status === "accepted") return "accepted-row";
    return "pending-row"; // New entries
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
        <div className="search-container">
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

      <div className="table-wrapper">
        <table className="data-table">
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
              <th className="actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={`${row.SYMBOL}-${index}`}
                className={getRowClassName(row)}
              >
                <td className="symbol-cell">{row.SYMBOL}</td>
                <td>₹{parseFloat(row.LTP).toFixed(2)}</td>
                <td>{formatChangeValue(row["%CHNG"])}</td>
                <td>{formatVolume(row["VOLUME (shares)"])}</td>
                <td className="upload-time-cell">
                  {row["Upload Date & Time"]}
                </td>
                <td className="actions-cell">
                  {row.status !== "rejected" && row.status !== "accepted" && (
                    <div className="action-buttons">
                      <button
                        className="accept-button"
                        onClick={() => onAcceptEntry(row.SYMBOL)}
                        title="Accept"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => onRejectEntry(row.SYMBOL)}
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {row.status === "accepted" && (
                    <span className="status-indicator accepted">✓</span>
                  )}
                  {row.status === "rejected" && (
                    <span className="status-indicator rejected">✗</span>
                  )}
                </td>
              </tr>
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
    </div>
  );
};

export default StockTable;
