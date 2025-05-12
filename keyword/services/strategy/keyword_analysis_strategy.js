class KeywordAnalysisStrategy {
  setContext(context) {
    throw new Error("setContext() must be implemented");
  }

  analyze(textNodes, pattern, keywordOccurrences) {
    throw new Error("analyze() must be implemented");
  }
}