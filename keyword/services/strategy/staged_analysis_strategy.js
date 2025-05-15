class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this._context = context;
  }

  analyze(textNodes, pattern, keyword) {
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      keyword.frequency += matches.length;
    });

    ["a", "p", ...Array.from({ length: 6 }, (_, i) => `h${i + 1}`)].forEach(tagName => {
      this._context.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
  } 
}