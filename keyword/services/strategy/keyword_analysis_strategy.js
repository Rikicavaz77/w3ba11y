class KeywordAnalysisStrategy {
  constructor() {
    if (new.target === KeywordAnalysisStrategy) {
      throw new Error('KeywordAnalysisStrategy cannot be instantiated directly');
    }
  }

  resetCache() {
    throw new Error("resetCache() must be implemented");
  }

  setContext(context) {
    throw new Error('setContext() must be implemented');
  }

  analyzeSimpleKeyword(textNodes, pattern, keyword) {
    throw new Error('analyzeSimpleKeyword() must be implemented');
  }

  analyzeCompoundKeyword(nodeGroups, pattern, keyword) {
    throw new Error('analyzeCompoundKeyword() must be implemented');
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordAnalysisStrategy;
}
