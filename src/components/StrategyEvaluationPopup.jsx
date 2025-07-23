import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STRATEGIES = {
  "Volume Breaker": [
    "Short only if stock ≥ 5% and after 10:30 AM",
    "Reversal → wait for 3rd/4th retest candle",
    "Volume drops 50% on/after retest",
    "Previous 4–5 volumes below average",
    "Entry near psychological levels",
  ],
  "Falling Knife": [
    "Strong uptrend, max 1 red",
    "Perfect V-shape",
    "2 bullish confirmation",
    "Entry on 3rd candle",
    "Next candle below 50% range",
  ],
};

const StrategyEvaluationPopup = ({
  symbol,
  isOpen,
  onClose,
  onScoreUpdate,
}) => {
  const [activeStrategy, setActiveStrategy] = useState("Volume Breaker");
  const [responses, setResponses] = useState({});

  // Load saved responses from localStorage
  useEffect(() => {
    if (isOpen && symbol) {
      const savedData = localStorage.getItem(`strategy_scores_${symbol}`);
      if (savedData) {
        setResponses(JSON.parse(savedData));
      } else {
        setResponses({});
      }
    }
  }, [isOpen, symbol]);

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (symbol && Object.keys(responses).length > 0) {
      localStorage.setItem(
        `strategy_scores_${symbol}`,
        JSON.stringify(responses)
      );

      // Calculate and update score for the active strategy
      const strategyResponses = responses[activeStrategy];
      if (strategyResponses) {
        const totalPoints = STRATEGIES[activeStrategy].length;
        const acceptedPoints = Object.values(strategyResponses).filter(
          (r) => r === "accept"
        ).length;
        const percentage = Math.round((acceptedPoints / totalPoints) * 100);
        onScoreUpdate(symbol, activeStrategy, percentage);
      }
    }
  }, [responses, activeStrategy, symbol, onScoreUpdate]);

  const handleResponse = (pointIndex, response) => {
    setResponses((prev) => {
      // Clear responses from other strategies when user makes a selection
      const otherStrategies = Object.keys(STRATEGIES).filter(
        (s) => s !== activeStrategy
      );
      const clearedResponses = { ...prev };
      otherStrategies.forEach((strategy) => {
        delete clearedResponses[strategy];
      });

      return {
        ...clearedResponses,
        [activeStrategy]: {
          ...clearedResponses[activeStrategy],
          [pointIndex]: response,
        },
      };
    });
  };

  const calculateScore = (strategy) => {
    const strategyResponses = responses[strategy];
    if (!strategyResponses) return 0;

    const totalPoints = STRATEGIES[strategy].length;
    const acceptedPoints = Object.values(strategyResponses).filter(
      (r) => r === "accept"
    ).length;
    return Math.round((acceptedPoints / totalPoints) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage === 0) return "#6b7280"; // Gray for 0%
    if (percentage <= 25) return "#dc2626"; // Red
    if (percentage <= 50) return "#ea580c"; // Orange
    if (percentage <= 75) return "#16a34a"; // Light Green
    return "#15803d"; // Dark Green
  };

  if (!isOpen) return null;

  return (
    <div
      className="strategy-popup-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="strategy-popup"
        style={{
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "8px",
          padding: "16px",
          maxWidth: "500px",
          width: "95%",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Strategy Tabs */}
        <div
          style={{
            display: "flex",
            marginBottom: "16px",
            borderBottom: "1px solid #374151",
          }}
        >
          {Object.keys(STRATEGIES).map((strategy) => {
            const score = calculateScore(strategy);
            const color = getScoreColor(score);

            return (
              <button
                key={strategy}
                onClick={() => setActiveStrategy(strategy)}
                style={{
                  background:
                    activeStrategy === strategy ? "#374151" : "transparent",
                  color: activeStrategy === strategy ? "#fff" : "#9ca3af",
                  border: "none",
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderRadius: "6px 6px 0 0",
                  fontWeight: activeStrategy === strategy ? "bold" : "normal",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                {strategy}
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: "bold",
                  }}
                >
                  {score}
                </div>
              </button>
            );
          })}
        </div>

        {/* Strategy Points */}
        <div>
          {STRATEGIES[activeStrategy].map((point, index) => {
            const currentResponse = responses[activeStrategy]?.[index];

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  marginBottom: "6px",
                  backgroundColor: "#374151",
                  borderRadius: "6px",
                  fontSize: "14px",
                  lineHeight: "1.4",
                }}
              >
                <span style={{ flex: 1, marginRight: "8px" }}>
                  {index + 1}. {point}
                </span>

                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleResponse(index, "accept")}
                    style={{
                      backgroundColor:
                        currentResponse === "accept" ? "#16a34a" : "#4b5563",
                      color: "#fff",
                      border: "none",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✓
                  </button>

                  <button
                    onClick={() => handleResponse(index, "reject")}
                    style={{
                      backgroundColor:
                        currentResponse === "reject" ? "#dc2626" : "#4b5563",
                      color: "#fff",
                      border: "none",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✗
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StrategyEvaluationPopup;
