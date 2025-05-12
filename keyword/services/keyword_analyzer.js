class KeywordAnalyzer {
  constructor(textProcessor, tagAccessor, wordCounter, strategy) {
    this._textProcessor = textProcessor;
    this._tagAccessor = tagAccessor;
    this._wordCounter = wordCounter;
    this._strategy = strategy;
    this._strategy.setContext(this);
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

  prepareAnalysisData() {
    this.countTagsOccurrences();
    this.textNodes = this._textProcessor.getTextNodes();
  }

  performAnalysis(keyword, textNodes, totalWords) {
    const pattern = this._textProcessor.getKeywordPattern(keyword.name);
    this._strategy.analyze(textNodes, pattern, keyword);
    ["title", "description", "alt"].forEach(tagName => {
      keyword.frequency += this.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
    keyword.calculateDensity(totalWords);
    keyword.calculateRelevanceScore(this._tagData);
    keyword.status = "done";
  }
  
  analyzeKeyword(keyword, totalWords) {
    this.prepareAnalysisData();
    this.performAnalysis(keyword, this.textNodes, totalWords);
  }

  analyzeKeywords(keywords, totalWords) {
    this.prepareAnalysisData();
    try {
      this._tagAccessor.useCache = true;
      keywords.forEach(keyword => {
        this.performAnalysis(keyword, this.textNodes, totalWords);
      });
    } finally {
      this._tagAccessor.useCache = false;
    }
  }
}
