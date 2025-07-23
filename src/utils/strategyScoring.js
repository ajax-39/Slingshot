// Utility functions for strategy scoring and localStorage management
import { calculateStrategyScore, getScoreColor } from "./strategyConfig";

export const getStrategyScore = (symbol, strategy) => {
  return calculateStrategyScore(symbol, strategy);
};

export const getBestStrategyScore = (symbol) => {
  const volumeBreakerScore = getStrategyScore(symbol, "Volume Breaker");
  const fallingKnifeScore = getStrategyScore(symbol, "Falling Knife");

  return Math.max(volumeBreakerScore, fallingKnifeScore);
};

export { getScoreColor };
