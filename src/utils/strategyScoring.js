// Utility functions for strategy scoring and localStorage management

export const getStrategyScore = (symbol, strategy) => {
  try {
    const savedData = localStorage.getItem(`strategy_scores_${symbol}`);
    if (!savedData) return 0;

    const responses = JSON.parse(savedData);
    const strategyResponses = responses[strategy];

    if (!strategyResponses) return 0;

    const strategies = {
      "Volume Breaker": 6, // 6 points
      "Falling Knife": 5, // 5 points
    };

    const totalPoints = strategies[strategy];
    const acceptedPoints = Object.values(strategyResponses).filter(
      (r) => r === "accept"
    ).length;

    return Math.round((acceptedPoints / totalPoints) * 100);
  } catch (error) {
    console.error("Error getting strategy score:", error);
    return 0;
  }
};

export const getBestStrategyScore = (symbol) => {
  const volumeBreakerScore = getStrategyScore(symbol, "Volume Breaker");
  const fallingKnifeScore = getStrategyScore(symbol, "Falling Knife");

  return Math.max(volumeBreakerScore, fallingKnifeScore);
};

export const getScoreColor = (percentage) => {
  if (percentage === 0) return "#6b7280"; // Gray for 0%
  if (percentage <= 25) return "#dc2626"; // Red
  if (percentage <= 50) return "#ea580c"; // Orange
  if (percentage <= 75) return "#16a34a"; // Light Green
  return "#15803d"; // Dark Green
};
