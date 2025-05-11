class AllInOneAnalysisStrategy extends KeywordAnalysisStrategy {
  findAncestors(node, occurrences, keywordOccurrences) {
    let current = node.parentNode;
    while (current && current !== this.root) {
      const tagName = current.nodeName.toLowerCase();
      if (this.allowedParentTags.includes(tagName)) {
        keywordOccurrences[tagName] += occurrences;
      }
      current = current.parentNode;
    };
  }

  analyze(textNodes, pattern) {
    const keywordOccurrences =  {
      title:      0,
      description:0,
      h1:         0,
      h2:         0,
      h3:         0,
      h4:         0,
      h5:         0,
      h6:         0,
      p:          0,
      a:          0,
      alt:        0,
    };
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      if (matches.legth > 0) {
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