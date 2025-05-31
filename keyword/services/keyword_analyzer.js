class KeywordAnalyzer {
  constructor(textProcessor, tagAccessor, wordCounter, strategy) {
    this._textProcessor = textProcessor;
    this._tagAccessor = tagAccessor;
    this._wordCounter = wordCounter;
    this.setStrategy(strategy);
  }

  get root() {
    return this._textProcessor.root;
  }

  get allowedParentTags() {
    return this._textProcessor.allowedParentTags;
  }

  setStrategy(strategy) {
    this._strategy = strategy;
    this._strategy.setContext(this);
  }

  countOccurrencesInTag(tagName, pattern) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return 0;
    tags = Array.isArray(tags) ? tags : [tags];
    let count = 0;
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      count += matches.length;
    });
    return count;
  }

  _prepareAnalysisData() {
    this._textNodes = this._textProcessor.getTextNodes();
  }

  _performAnalysis(keyword) {
    if (keyword.status === 'done') {
      keyword.reset();
    }

    const pattern = this._textProcessor.getKeywordPattern(keyword.name);
    this._strategy.analyze(this._textNodes, pattern, keyword);
    ["title", "description", "alt"].forEach(tagName => {
      let count = this.countOccurrencesInTag(tagName, pattern);
      keyword.frequency += count;
      keyword.keywordOccurrences[tagName] += count;
    });
    keyword.calculateDensity(this._wordCounter.totalWords);
    keyword.status = 'done';
  }
  
  analyzeKeyword(keyword) {
    this._prepareAnalysisData();
    this._performAnalysis(keyword);
  }

  analyzeKeywords(keywords) {
    if (keywords.length === 0) return;
    
    this._prepareAnalysisData();
    try {
      this._tagAccessor.useCache = true;
      keywords.forEach(keyword => {
        this._performAnalysis(keyword);
      });
    } finally {
      this._tagAccessor.useCache = false;
    }
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordAnalyzer;
}

