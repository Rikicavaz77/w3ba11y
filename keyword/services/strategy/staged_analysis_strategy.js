class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  countOccurrencesInTag(tagName, keywordOccurences) {
    const tags = this.doc.querySelectorAll(`${tagName}`);
    tags.forEach(tag => {
      const tagContent = tag.innerText;
      const matches = tagContent.match(pattern) || [];
      keywordOccurences[tagName] += matches.length;
    });
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
      frequency += matches.length;
    });

    ["a", "p", ...Array.from({ length: 6 }, (_, i) => `h${i + 1}`)].forEach(tagName => {
      this.countOccurrencesInTag(tagName, keywordOccurrences);
    });

    return {
      frequency,
      keywordOccurrences
    }
  } 
}