class KeywordAnalysisStrategy {
  constructor() {
    if (new.target === KeywordAnalysisStrategy) {
      throw new Error('KeywordAnalysisStrategy cannot be instantiated directly');
    }
  }

  setContext(context) {
    throw new Error('setContext() must be implemented');
  }

  analyze(textNodes, pattern, keyword) {
    throw new Error('analyze() must be implemented');
  }
}

// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordAnalysisStrategy;
}
