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

  _prepareAnalysisData(keywords = []) {
    const hasSimple = keywords.some(k => !/\s+/.test(k.name));
    const hasCompound = keywords.some(k => /\s+/.test(k.name));

    if (hasSimple) {
      this._textNodes = this._textProcessor.getTextNodes();
    }

    if (hasCompound) {
      this._nodeGroups = this._textProcessor.getTextNodeGroups();
    }
  }

  _performAnalysis(keyword) {
    if (keyword.status === 'done') {
      keyword.reset();
    }

    const isCompound = /\s+/.test(keyword.name);
    const pattern = this._textProcessor.getKeywordPattern(keyword.name);
    
    if (isCompound) {
      this._strategy.analyzeCompoundKeyword(this._nodeGroups, pattern, keyword);
    } else {
      this._strategy.analyzeSimpleKeyword(this._textNodes, pattern, keyword);
    }

    ["title", "description", "alt"].forEach(tagName => {
      let count = this.countOccurrencesInTag(tagName, pattern);
      keyword.frequency += count;
      keyword.keywordOccurrences[tagName] += count;
    });

    keyword.calculateDensity(this._wordCounter.totalWords);
    keyword.status = 'done';
  }
  
  analyzeKeyword(keyword) {
    this._prepareAnalysisData([keyword]);
    this._performAnalysis(keyword);
    this._strategy.reset();
  }

  analyzeKeywords(keywords) {
    if (keywords.length === 0) return;
    
    this._prepareAnalysisData(keywords);
    try {
      this._tagAccessor.useCache = true;
      keywords.forEach(keyword => {
        this._performAnalysis(keyword);
      });
    } finally {
      this._tagAccessor.useCache = false;
      this._strategy.reset();
    }
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordAnalyzer;
}
