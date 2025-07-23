// Shared strategy configuration for both popup and scoring
export const STRATEGIES = {
  "Volume Breaker": [
    "Short only if stock ≥ 5%, after 10:30 AM, not All Time High",
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

// Shared score calculation logic
export const calculateStrategyScore = (symbol, strategy) => {
  try {
    if (!symbol || !strategy || !STRATEGIES[strategy]) {
      return 0;
    }

    const savedData = localStorage.getItem(`strategy_scores_${symbol}`);
    if (!savedData) return 0;

    const responses = JSON.parse(savedData);
    const strategyResponses = responses[strategy];

    if (!strategyResponses || Object.keys(strategyResponses).length === 0) {
      return 0;
    }

    const totalPoints = STRATEGIES[strategy].length;
    const acceptedPoints = Object.values(strategyResponses).filter(
      (r) => r === "accept"
    ).length;
    const rejectedPoints = Object.values(strategyResponses).filter(
      (r) => r === "reject"
    ).length;

    // Use exact same calculation: ((accepted - rejected) / total) * 100
    const percentage = Math.round(
      ((acceptedPoints - rejectedPoints) / totalPoints) * 100
    );

    return percentage;
  } catch (error) {
    console.error("Error calculating strategy score:", error);
    return 0;
  }
};

// Shared color logic
export const getScoreColor = (percentage) => {
  if (percentage === 0) return "#6b7280"; // Gray for 0%

  // Negative scores - darker red shades
  if (percentage <= -75) return "#7f1d1d"; // Very dark red
  if (percentage <= -50) return "#991b1b"; // Dark red
  if (percentage <= -25) return "#b91c1c"; // Medium dark red
  if (percentage < 0) return "#dc2626"; // Red

  // Positive scores
  if (percentage <= 25) return "#ea580c"; // Orange
  if (percentage <= 50) return "#d97706"; // Amber
  if (percentage <= 75) return "#16a34a"; // Light Green
  return "#15803d"; // Dark Green
};
