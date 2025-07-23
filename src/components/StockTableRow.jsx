import { Check, X } from "lucide-react";
import ScoreCircle from "./ScoreCircle";

const StockTableRow = ({
  row,
  index,
  isMobile,
  slingshotActive,
  onAcceptEntry,
  onRejectEntry,
  onFlagEntry,
  onScoreClick,
  scoreUpdateTrigger,
  getRowClassName,
  formatChangeValue,
  formatTimeOnly,
  formatVolume,
}) => {
  const handleFlagEntry = (symbol) => {
    if (onFlagEntry) {
      onFlagEntry(symbol);
    }
  };

  // Slingshot filter match
  const ltp = parseFloat(row.LTP);
  const vol = parseFloat(row["VOLUME (shares)"]);
  const chng = parseFloat(row["%CHNG"]);
  const isSlingshot =
    slingshotActive && ltp >= 100 && ltp <= 3000 && vol >= 1000000 && chng > 3;

  return (
    <tr key={`${row.SYMBOL}-${index}`} className={getRowClassName(row)}>
      <td
        className="score-cell"
        style={{ textAlign: "center", padding: "8px" }}
      >
        <ScoreCircle
          symbol={row.SYMBOL}
          onClick={onScoreClick}
          key={`score-${row.SYMBOL}-${scoreUpdateTrigger}`}
        />
      </td>
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
};

export default StockTableRow;
