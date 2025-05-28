class KeywordAnalyzer {
  constructor(textProcessor, tagAccessor, wordCounter, strategy) {
    this._textProcessor = textProcessor;
    this._tagAccessor = tagAccessor;
    this._wordCounter = wordCounter;
    this.setStrategy(strategy);
    this._tagData = {
      title:       { weight: 7 },
      description: { weight: 6 },
      h1:          { weight: 6 },
      h2:          { weight: 5 },
      h3:          { weight: 4 },
      h4:          { weight: 2 },
      h5:          { weight: 2 },
      h6:          { weight: 2 },
      p:           { weight: 0, },
      strong:      { weight: 0, },
      em:          { weight: 0, },
      a:           { weight: 2.5 },
      li:          { weight: 0 },
      alt:         { weight: 2.5 }
    };
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

  countTagsOccurrences() {
    for (const tagName of Object.keys(this._tagData)) {
      if (this._tagData[tagName].weight) {
        this._tagData[tagName].tagOccurrences = this._tagAccessor.getTagOccurrences(tagName);
      }
    }
  }

  countOccurrencesInTag(tagName, pattern) {
    let tags = this._tagAccessor.getTag(tagName);
    let count = 0;
    if (!tags) return count;
    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      count += matches.length;
    });
    return count;
  }

  _prepareAnalysisData() {
    this.countTagsOccurrences();
    this._textNodes = this._textProcessor.getTextNodes();
  }

  _performAnalysis(keyword, textNodes) {
    const pattern = this._textProcessor.getKeywordPattern(keyword.name);
    this._strategy.analyze(textNodes, pattern, keyword);
    ["title", "description", "alt"].forEach(tagName => {
      const count = this.countOccurrencesInTag(tagName, pattern);
      keyword.frequency += count;
      keyword.keywordOccurrences[tagName] += count;
    });
    keyword.calculateDensity(this._wordCounter.totalWords);
    keyword.calculateRelevanceScore(this._tagData);
    keyword.status = "done";
  }
  
  analyzeKeyword(keyword) {
    this._prepareAnalysisData();
    this._performAnalysis(keyword, this._textNodes);
  }

  analyzeKeywords(keywords) {
    this._prepareAnalysisData();
    try {
      this._tagAccessor.useCache = true;
      keywords.forEach(keyword => {
        this._performAnalysis(keyword, this._textNodes);
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

