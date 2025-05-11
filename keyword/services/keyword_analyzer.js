class KeywordAnalyzer extends TextProcessor {
  constructor(doc, treeWalker, tagAccessor, strategy) {
    super(doc, treeWalker);
    this._tagAccessor = tagAccessor;
    this._strategy = strategy;
    this._tagData = {
      title:      { weight: 10 },
      description:{ weight: 6 },
      h1:         { weight: 5 },
      h2:         { weight: 4 },
      h3:         { weight: 3 },
      h4:         { weight: 2 },
      h5:         { weight: 2 },
      h6:         { weight: 2 },
      p:          { weight: 0, },
      a:          { weight: 1.5 },
      alt:        { weight: 2.5 }
    };
  }

  setStrategy(strategy) {
    this._strategy = strategy;
  }

  saveTextNodes() {
    this.textNodes = this.getTextNodes();
  }

  countTagsOccurrences() {
    for (const tagName of Object.keys(this._tagData)) {
      this._tagData[tagName] = this._tagAccessor.getTagOccurences(tagName);
    }
  }

  performAnalysis(textNodes) {
    const pattern = this.getKeywordPattern(keyword);
    const result = this._strategy.analyze(textNodes, pattern);
    result.density = this.calculateDensity(result.frequency, totalWords);
    Object.assign(result, this.countOccurrencesInTag("title"));
    Object.assign(result, this.countOccurrencesInMetaTag("description"));
    Object.assign(result, this.countOccurrencesInAltAttributes());
    result.status = "done";
    return result;
  }
  
  analyzeKeyword(keyword, totalWords) {
    this.countTagsOccurrences();
    const textNodes = this.getTextNodes();
    const result = this.performAnalysis(keyword, textNodes, totalWords);
    return new Keyword(keyword, result);
  }

  analyzeKeywords(keywords, totalWords) {
    const textNodes = this.getTextNodes();
    this.countTagsOccurrences();
    return keywords.map(keyword => {
      const pattern = this.getKeywordPattern(keyword);
      const result = this._strategy.analyze(textNodes, pattern);
      result.density = this.calculateDensity(result.frequency, totalWords);
      Object.assign(result, this.countOccurrencesInTag("title"));
      Object.assign(result, this.countOccurrencesInMetaTag("description"));
      Object.assign(result, this.countOccurrencesInAltAttributes());
      result.status = "done";
      return new Keyword(keyword, result);
    });
  }
}