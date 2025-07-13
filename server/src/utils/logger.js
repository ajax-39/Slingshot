// Logger utility for debugging and monitoring
import { format } from "util";

class Logger {
  static formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formatted = args.length > 0 ? format(message, ...args) : message;
    return `[${timestamp}] ${level.toUpperCase()}: ${formatted}`;
  }

  static info(message, ...args) {
    const formatted = this.formatMessage("info", message, ...args);
    console.log(`ℹ️  ${formatted}`);
  }

  static warn(message, ...args) {
    const formatted = this.formatMessage("warn", message, ...args);
    console.warn(`⚠️  ${formatted}`);
  }

  static error(message, ...args) {
    const formatted = this.formatMessage("error", message, ...args);
    console.error(`❌ ${formatted}`);
  }

  static debug(message, ...args) {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
      const formatted = this.formatMessage("debug", message, ...args);
      console.log(`🐛 ${formatted}`);
    }
  }

  static success(message, ...args) {
    const formatted = this.formatMessage("success", message, ...args);
    console.log(`✅ ${formatted}`);
  }

  static start(message, ...args) {
    const formatted = this.formatMessage("start", message, ...args);
    console.log(`🚀 ${formatted}`);
  }
}

export default Logger;
