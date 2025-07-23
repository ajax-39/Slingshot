import { ChevronUp, ChevronDown, Filter } from "lucide-react";

const StockTableHeader = ({
  isMobile,
  sortConfig,
  onSort,
  onStatusSort,
  activeFilter,
  onToggleFilter,
  onColumnFilter,
  columnFilters,
  getSortIcon,
}) => {
  const renderFilterDropdown = (column) => {
    if (activeFilter !== column) return null;

    if (column === "SYMBOL") {
      return (
        <div className="filter-dropdown">
          <div className="filter-header">
            <span>Search Symbol</span>
            <button
              className="close-filter"
              onClick={() => onToggleFilter(null)}
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="Search symbol..."
            value={columnFilters.SYMBOL}
            onChange={(e) => onColumnFilter("SYMBOL", e.target.value)}
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
              onClick={() => onToggleFilter(null)}
            >
              ×
            </button>
          </div>
          <div
            className="filter-option"
            onClick={() => onColumnFilter("LTP", "all")}
          >
            All
          </div>
          <div
            className="filter-option"
            onClick={() => onColumnFilter("LTP", "asc")}
          >
            Sort Ascending
          </div>
          <div
            className="filter-option"
            onClick={() => onColumnFilter("LTP", "desc")}
          >
            Sort Descending
          </div>
          <div
            className="filter-option"
            onClick={() => onColumnFilter("LTP", "range_100_3000")}
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
          <button className="close-filter" onClick={() => onToggleFilter(null)}>
            ×
          </button>
        </div>
        <div
          className="filter-option"
          onClick={() => onColumnFilter(column, "all")}
        >
          All
        </div>
        <div
          className="filter-option"
          onClick={() => onColumnFilter(column, "asc")}
        >
          Sort Ascending
        </div>
        <div
          className="filter-option"
          onClick={() => onColumnFilter(column, "desc")}
        >
          Sort Descending
        </div>
      </div>
    );
  };

  return (
    <thead>
      <tr>
        <th className="column-header score-column">
          <div className="column-header-content">
            <span>SCORE</span>
          </div>
        </th>
        <th className="column-header">
          <div className="column-header-content">
            <span onClick={() => onSort("SYMBOL")}>
              SYMBOL {getSortIcon("SYMBOL")}
            </span>
            <button
              className="filter-button"
              onClick={() => onToggleFilter("SYMBOL")}
            >
              <Filter size={14} />
            </button>
          </div>
          {renderFilterDropdown("SYMBOL")}
        </th>
        <th className="column-header">
          <div className="column-header-content">
            <span onClick={() => onSort("%CHNG")}>
              %CHNG {getSortIcon("%CHNG")}
            </span>
            <button
              className="filter-button"
              onClick={() => onToggleFilter("%CHNG")}
            >
              <Filter size={14} />
            </button>
          </div>
          {renderFilterDropdown("%CHNG")}
        </th>
        {isMobile && <th className="actions-column">ACTIONS</th>}
        <th className="column-header">
          <div className="column-header-content">
            <span onClick={() => onSort("LTP")}>LTP {getSortIcon("LTP")}</span>
            <button
              className="filter-button"
              onClick={() => onToggleFilter("LTP")}
            >
              <Filter size={14} />
            </button>
          </div>
          {renderFilterDropdown("LTP")}
        </th>
        {!isMobile && (
          <th className="column-header">
            <div className="column-header-content">
              <span onClick={onStatusSort}>
                ACTIONS {getSortIcon("status")}
              </span>
            </div>
          </th>
        )}
        <th className="column-header">
          <div className="column-header-content">
            <span onClick={() => onSort("Upload Date & Time")}>
              TIME {getSortIcon("Upload Date & Time")}
            </span>
            <button
              className="filter-button"
              onClick={() => onToggleFilter("Upload Date & Time")}
            >
              <Filter size={14} />
            </button>
          </div>
          {renderFilterDropdown("Upload Date & Time")}
        </th>
        {!isMobile && (
          <th className="column-header">
            <div className="column-header-content">
              <span onClick={() => onSort("VOLUME (shares)")}>
                VOL {getSortIcon("VOLUME (shares)")}
              </span>
              <button
                className="filter-button"
                onClick={() => onToggleFilter("VOLUME (shares)")}
              >
                <Filter size={14} />
              </button>
            </div>
            {renderFilterDropdown("VOLUME (shares)")}
          </th>
        )}
      </tr>
    </thead>
  );
};

export default StockTableHeader;
