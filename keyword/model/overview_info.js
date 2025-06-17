class OverviewInfo {
  constructor(wordCount, uniqueWordCount, metaKeywordsTagContent, lang) {
    this._wordCount = wordCount;
    this._uniqueWordCount = uniqueWordCount;
    this._metaKeywordsTagContent = metaKeywordsTagContent;
    this._lang = lang;
  } 

  set wordCount(wordCount) {
    this._wordCount = wordCount;
  }

  set uniqueWordCount(uniqueWordCount) {
    this._uniqueWordCount = uniqueWordCount;
  }

  get wordCount() {
    return this._wordCount;
  }

  get uniqueWordCount() {
    return this._uniqueWordCount;
  }

  get metaKeywordsTagContent() {
    return this._metaKeywordsTagContent;
  }

  get lang() {
    return this._lang;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = OverviewInfo;
}
