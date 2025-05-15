class KeywordAnalyzer {
  constructor(textProcessor, tagAccessor, wordCounter, strategy) {
    this._textProcessor = textProcessor;
    this._tagAccessor = tagAccessor;
    this._wordCounter = wordCounter;
    this.setStrategy(strategy);
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
      this._tagData[tagName].tagOccurrences = this._tagAccessor.getTagOccurrences(tagName);
    }
  }

  countOccurrencesInTag(tagName, pattern, keywordOccurrences) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return;
    tags = Array.isArray(tags) ? tags : [tags];
    let count = 0;
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      count += matches.length;
      keywordOccurrences[tagName] += matches.length;
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
      keyword.frequency += this.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
    keyword.calculateDensity(this._wordCounter.totalWords);
    keyword.calculateRelevanceScore(this._tagData);
    keyword.status = "done";
  }
  
  analyzeKeyword(keyword) {
    this._prepareAnalysisData();
    this._performAnalysis(keyword, this._textNodes, this._wordCounter.totalWords);
  }

  analyzeKeywords(keywords) {
    this._prepareAnalysisData();
    try {
      this._tagAccessor.useCache = true;
      keywords.forEach(keyword => {
        this._performAnalysis(keyword, this._textNodes, this._wordCounter.totalWords);
      });
    } finally {
      this._tagAccessor.useCache = false;
    }
  }
}
