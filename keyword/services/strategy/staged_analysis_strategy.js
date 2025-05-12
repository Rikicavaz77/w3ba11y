class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this.context = context;
  }

  analyze(textNodes, pattern, keywordOccurrences) {
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      frequency += matches.length;
    });

    ["a", "p", ...Array.from({ length: 6 }, (_, i) => `h${i + 1}`)].forEach(tagName => {
      this.context.countOccurrencesInTag(tagName, keywordOccurrences);
    });

    return {
      frequency,
      keywordOccurrences
    }
  } 
}