class AllInOneAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this._context = context;
  }

  _findAncestors(node, occurrences, keywordOccurrences) {
    let current = node.parentNode;
    while (current && current !== this._context.root) {
      const tagName = current.nodeName.toLowerCase();
      if (this._context.allowedParentTags.includes(tagName)) {
        keywordOccurrences[tagName] = (keywordOccurrences[tagName] || 0) + occurrences;
      }
      current = current.parentNode;
    };
  }

  analyze(textNodes, pattern, keyword) {
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      if (matches.length > 0) {
        this._findAncestors(node, matches.length, keyword.keywordOccurrences);
      }
      keyword.frequency += matches.length;
    });
  } 
}

// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = AllInOneAnalysisStrategy;
}
