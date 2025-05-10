class KeywordAnalyzer extends TextProcessor {
  constructor(doc, treeWalker) {
    super(doc, treeWalker);
  }

  saveTextNodes() {
    this.textNodes = this.getTextNodes();
  }

  calculateFrequency(textNodes, pattern) {
    let frequency = 0;
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      frequency += matches.length;
    });
    return frequency;
  }

  calculateDensity(frequency, totalWords) {
    return ((frequency / Math.max(1, totalWords)) * 100).toFixed(2);
  }

  countOccurrencesInTag(tagName, pattern) {
    const result = {};
    const tags = this.doc.querySelectorAll(`${tagName}`);
    result[tagName] = { tagOccurrences: tags.length };
    tags.forEach(tag => {
      const tagContent = tag.innerText;
      const matches = tagContent.match(pattern) || [];
      result[tagName].keywordOccurrences += matches.length;
    });
    return result;
  }

  countOccurrencesInMetaTag(tagName, pattern) {
    const result = {};
    const tag = this.doc.querySelector(`meta[name='${tagName}' i]`);
    result[tagName] = { tagOccurrences: tag ? 1 : 0 };
    const tagContent = tag?.content;
    if (tagContent) {
      const matches = tagContent.match(this.pattern) || [];
      result[tagName].keywordOccurrences = matches.length;
    }
    return result;
  } 

  countOccurrencesInAltAttributes() {
    const result = {};
    const tags = this.doc.querySelectorAll("img[alt]");
    result.alt = { tagOccurrences : tags.length };
    tags.forEach((tag) => {
      const tagContent = tag.alt;
      const matches = tagContent.match(this.pattern) || [];
      result.alt.keywordOccurrences += matches.length;
    });
    return result;
  } 

  getAnalysisResult(textNodes, pattern, totalWords) {
    const result = {};
    const frequency = this.calculateFrequency(textNodes, pattern);
    result.frequency = frequency;
    const density = this.calculateDensity(frequency, totalWords);
    console.log(totalWords);
    result.density = density;
    Object.assign(result, this.countOccurrencesInTag("title"));
    Object.assign(result, this.countOccurrencesInMetaTag("description"));
    for (let i = 1; i <= 6; i++) {
      Object.assign(result, this.countOccurrencesInTag(`h${i}`));
    }
    Object.assign(result, this.countOccurrencesInTag("p"));
    Object.assign(result, this.countOccurrencesInTag("a"));
    Object.assign(result, this.countOccurrencesInAltAttributes());
    result.status = "done";
    return result;
  }
  
  analyzeKeyword(keyword, totalWords) {
    const textNodes = this.getTextNodes();
    const pattern = this.getKeywordPattern(keyword);
    const result = this.getAnalysisResult(textNodes, pattern, totalWords);
    return new Keyword(keyword, result);
  }

  analyzeKeywords(keywords, totalWords) {
    const textNodes = this.getTextNodes();
    return keywords.map(keyword => {
      const pattern = this.getKeywordPattern(keyword);
      const result = this.getAnalysisResult(textNodes, pattern, totalWords);
      return new Keyword(keyword, result);
    });
  }
}