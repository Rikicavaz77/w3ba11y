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

  _resetCache({ text = false, tags = false, words = false, strategy = false } = {}) {
    if (text) this._textProcessor.resetCache();
    if (tags) this._tagAccessor.resetCache();
    if (words) this._wordCounter.resetCache();
    if (strategy) this._strategy.resetCache();
  }

  fullRefresh() {
    this._resetCache({
      text: true,
      tags: true,
      words: true,
      strategy: true
    });
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

  _performAnalysis(keyword) {
    if (keyword.status === 'done') keyword.reset();

    const isCompound = /\s+/.test(keyword.name);
    const pattern = this._textProcessor.getKeywordPattern(keyword.name);
    
    if (isCompound) {
      const nodeGroups = this._textProcessor.getTextNodeGroups();
      this._strategy.analyzeCompoundKeyword(nodeGroups, pattern, keyword);
    } else {
      const textNodes = this._textProcessor.getTextNodes();
      this._strategy.analyzeSimpleKeyword(textNodes, pattern, keyword);
    }

    ['title', 'description', 'alt'].forEach(tagName => {
      const count = this.countOccurrencesInTag(tagName, pattern);
      keyword.frequency = (keyword.frequency || 0) + count;
      keyword.keywordOccurrences[tagName] = (keyword.keywordOccurrences[tagName] || 0) + count;
    });

    keyword.calculateDensity(this._wordCounter.totalWords);
    keyword.status = 'done';
  }
  
  analyzeKeyword(keyword) {
    this._performAnalysis(keyword);
  }

  analyzeKeywords(keywords) {
    if (keywords.length === 0) return;

    const prevTextCache = this._textProcessor.useCache;
    const prevTagCache = this._tagAccessor.useCache;

    try {
      if (!prevTextCache) this._textProcessor.useCache = true;
      if (!prevTagCache) this._tagAccessor.useCache = true;

      keywords.forEach(keyword => {
        this._performAnalysis(keyword);
      });
    } finally {
      if (!prevTextCache) this._textProcessor.useCache = false;
      if (!prevTagCache) this._tagAccessor.useCache = false;

      this._resetCache({
        text: !prevTextCache,
        tags: !prevTagCache
      });
    }
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordAnalyzer;
}
