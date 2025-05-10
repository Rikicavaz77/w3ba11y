class KeywordAnalyzer extends TextProcessor {
  constructor(doc, treeWalker) {
    super(doc, treeWalker);
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
}