class AllInOneAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this.context = context;
  }

  findAncestors(node, occurrences, keywordOccurrences) {
    let current = node.parentNode;
    while (current && current !== this.context.root) {
      const tagName = current.nodeName.toLowerCase();
      if (this.context.allowedParentTags.includes(tagName)) {
        keywordOccurrences[tagName] = (keywordOccurrences[tagName] || 0) + occurrences;
      }
      current = current.parentNode;
    };
  }

  analyze(textNodes, pattern, keyword) {
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      if (matches.length > 0) {
        this.findAncestors(node, matches.length, keyword.keywordOccurrences);
      }
      frequency += matches.length;
    });
    keyword.frequency = frequency;
  } 
}