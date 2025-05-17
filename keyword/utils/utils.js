class Utils {
  static escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  } 

  static sanitizeInput(text) {
    return text
      .replace(/[^\p{L}\p{N} \-_.’']/gu, '')
      .replace(/ {2,}/g, ' ')
      .trim();
  }
}
