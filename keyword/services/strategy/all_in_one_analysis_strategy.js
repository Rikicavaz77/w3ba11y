class AllInOneAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this.context = context;
  }

  findAncestors(node, occurrences, keywordOccurrences) {
    let current = node.parentNode;
    while (current && current !== this.root) {
      const tagName = current.nodeName.toLowerCase();
      if (this.context.allowedParentTags.includes(tagName)) {
        keywordOccurrences[tagName] += occurrences;
      }
      current = current.parentNode;
    };
  }

  analyze(textNodes, pattern, keywordOccurrences) {
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      if (matches.length > 0) {
        this.findAncestors(node, matches.length, keywordOccurrences);
      }
      frequency += matches.length;
    });
    return {
      frequency,
      keywordOccurrences
    }
  } 
}