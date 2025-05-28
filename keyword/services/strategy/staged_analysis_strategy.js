class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this._context = context;
  }

  analyze(textNodes, pattern, keyword) {
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      keyword.frequency += matches.length;
    });

    this._context.allowedParentTags.forEach(tagName => {
      const count = this._context.countOccurrencesInTag(tagName, pattern);
      keyword.keywordOccurrences[tagName] += count;
    });
  } 
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = StagedAnalysisStrategy;
}