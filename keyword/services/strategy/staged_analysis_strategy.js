class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this._context = context;
  }

  reset() {}

  analyze(nodeGroups, pattern, keyword) {
    nodeGroups.forEach(({ virtualText }) => {
      const matches = virtualText.match(pattern) || [];
      keyword.frequency += matches.length;
    });

    this._context.allowedParentTags.forEach(tagName => {
      this._context.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
  } 
}