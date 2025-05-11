class KeywordAnalyzer extends TextProcessor {
  constructor(doc, treeWalker) {
    super(doc, treeWalker, strategy);
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

  saveTextNodes() {
    this.textNodes = this.getTextNodes();
  }

  setStrategy(strategy) {
    this._strategy = strategy;
  }

  saveTags() {
    this.tagCache = {};
    for (const [tagName, data] of Object.entries(this._tagData)) {
      if (data.type === "multi") {
        this.tagCache[tagName] = this.doc.querySelectorAll(data.selector);
      } else {
        this.tagCache[tagName] = this.doc.querySelector(data.selector);
      }
    }
  }

  countTagsOccurrences() {
    for (const [_, data] of Object.entries(this._tagData)) {
      if (data.type === "multi") {
        data.tagOccurrences = this.doc.querySelectorAll(data.selector).length;
      } else {
        data.tagOccurrences = this.doc.querySelector(data.selector) ? 1 : 0;
      }
    }
  }

  calculateDensity(frequency, totalWords) {
    return ((frequency / Math.max(1, totalWords)) * 100).toFixed(2);
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
    const textNodes = this.getTextNodes();
    const result = this.performAnalysis(keyword, textNodes, totalWords);
    return new Keyword(keyword, result);
  }

  analyzeKeywords(keywords, totalWords) {
    const textNodes = this.getTextNodes();
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