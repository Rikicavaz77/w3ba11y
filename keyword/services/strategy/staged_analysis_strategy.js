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
      this._context.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
  } 
}