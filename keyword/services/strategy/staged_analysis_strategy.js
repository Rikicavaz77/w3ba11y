class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this.context = context;
  }

  analyze(textNodes, pattern, keyword) {
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      frequency += matches.length;
    });
    keyword.frequency = frequency;

    ["a", "p", ...Array.from({ length: 6 }, (_, i) => `h${i + 1}`)].forEach(tagName => {
      this.context.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
  } 
}