import { getBestStrategyScore, getScoreColor } from "../utils/strategyScoring";

const ScoreCircle = ({ symbol, onClick }) => {
  const score = getBestStrategyScore(symbol);
  const color = getScoreColor(score);

  return (
    <div
      onClick={() => onClick(symbol)}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        border: score === 0 ? "2px solid #6b7280" : "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease",
        transform: "scale(1)",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
      }}
      title={`Click to evaluate ${symbol} strategy score (Current: ${score}%)`}
    >
      {score}%
    </div>
  );
};

export default ScoreCircle;
