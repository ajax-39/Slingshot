import { Upload, BarChart3, Trash2 } from "lucide-react";

const Navigation = ({
  currentView,
  setCurrentView,
  dataCount,
  onClearAllData,
}) => {
  return (
    <nav className="navigation">
      <h1 className="nav-brand">Ajax</h1>

      <div className="nav-buttons">
        <button
          className={`nav-button ${currentView === "upload" ? "active" : ""}`}
          onClick={() => setCurrentView("upload")}
        >
          <Upload size={16} />
          Upload CSV
        </button>

        <button
          className={`nav-button ${currentView === "scanner" ? "active" : ""}`}
          onClick={() => setCurrentView("scanner")}
          disabled={dataCount === 0}
        >
          <BarChart3 size={16} />
          Stock Scanner
          {dataCount > 0 && <span className="data-count">({dataCount})</span>}
        </button>

        {dataCount > 0 && (
          <button
            className="nav-button clear-button"
            onClick={onClearAllData}
            title="Clear all data"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
