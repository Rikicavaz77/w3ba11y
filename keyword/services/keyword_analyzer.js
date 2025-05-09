class KeywordAnalyzer extends TextProcessor {
  constructor(doc, treeWalker) {
    super(doc, treeWalker);
  }

  analyzeKeywords(keywords) {
    const textNodes = this.getTextNodes();
    return keywords.map(keyword => {
      const pattern = this.getKeywordPattern(keyword);
      let frequency = 0;
      textNodes.forEach(node => {
        const matches = node.nodeValue.match(pattern) || [];
        frequency += matches.length;
      });
      return new Keyword(keyword, frequency);
    });
  }

  analyzeKeyword(keyword) {
    const textNodes = this.getTextNodes();
    const pattern = this.getKeywordPattern(keyword);
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      frequency += matches.length;
    });
    return new Keyword(keyword, frequency);
  }
}