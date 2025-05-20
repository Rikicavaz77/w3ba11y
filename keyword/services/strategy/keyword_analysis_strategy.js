class KeywordAnalysisStrategy {
  constructor() {
    if (new.target === KeywordAnalysisStrategy) {
      throw new Error("KeywordAnalysisStrategy cannot be instantiated directly");
    }
  }

  reset() {
    throw new Error("reset() must be implemented");
  }

  setContext(context) {
    throw new Error("setContext() must be implemented");
  }

  analyze(nodeGroups, pattern, keyword) {
    throw new Error("analyze() must be implemented");
  }
}
