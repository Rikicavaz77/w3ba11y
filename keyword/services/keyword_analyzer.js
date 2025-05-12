class KeywordAnalyzer extends TextProcessor {
  constructor(doc, treeWalker, tagAccessor, strategy) {
    super(doc, treeWalker);
    this._tagAccessor = tagAccessor;
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

  setStrategy(strategy) {
    this._strategy = strategy;
    this._strategy.setContext(this);
  }

  countTagsOccurrences() {
    for (const tagName of Object.keys(this._tagData)) {
      this._tagData[tagName] = this._tagAccessor.getTagOccurences(tagName);
    }
  }

  countOccurrencesInTag(tagName, pattern, keywordOccurrences) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return;
    tags = Array.isArray(tags) ? tags : [tags];
    keywordOccurrences[tagName] = 0;
    tags.forEach(tag => {
      const text = this.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      keywordOccurrences[tagName] += matches.length;
    });
    return keywordOccurrences;
  }

  prepareAnalysisData() {
    this.countTagsOccurrences();
    this.textNodes = this.getTextNodes();
  }

  performAnalysis(keyword, textNodes, totalWords) {
    const pattern = this.getKeywordPattern(keyword.name);
    this._strategy.analyze(textNodes, pattern, keyword.keywordOccurrences);
    ["title", "description", "alt"].forEach(tagName => {
      this.countOccurrencesInTag(tagName, pattern, keyword.keywordOccurrences);
    });
    keyword.status = "done";
    keyword.calculateDensity(totalWords);
    keyword.calculateRelevanceScore(this._tagData);
  }
  
  analyzeKeyword(keyword, totalWords) {
    this.prepareAnalysisData();
    this.performAnalysis(keyword, this.textNodes, totalWords);
  }

  analyzeKeywords(keywords, totalWords) {
    this.prepareAnalysisData();
    keywords.forEach(keyword => {
      this.performAnalysis(keyword, this.textNodes, totalWords);
    });
  }
}