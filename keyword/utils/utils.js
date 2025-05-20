class Utils {
  static escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  } 

  static sanitizeInput(text) {
    return text
      .replace(/[^\p{L}\p{N} ’'_.-]|(?<![\p{L}\p{N}])[’'_.-]|[’'_.-](?![\p{L}\p{N}])/gu, '')
      .replace(/ {2,}/g, ' ')
      .trim();
  }
}

// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== undefined && typeof module.exports !== undefined) {
  module.exports = Utils;
}
