class Utils {
  static escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  } 

  static escapeHTML(text) {
    return text
      .replace(/&/g ,'&amp;')
      .replace(/"/g ,'&quot;')
      .replace(/'/g ,'&#039;')
      .replace(/</g ,'&lt;')
      .replace(/>/g ,'&gt;');
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Utils;
}
