class OverviewInfo {
  constructor(wordCount, uniqueWordCount, metaKeywordsTagContent, lang, metaDescriptionTagContent) {
    this._wordCount = wordCount;
    this._uniqueWordCount = uniqueWordCount;
    this._metaKeywordsTagContent = metaKeywordsTagContent;
    this._lang = lang;
    this._metaDescriptionTagContent = metaDescriptionTagContent;
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

  get metaDescriptionTagContent() {
    return this._metaDescriptionTagContent;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = OverviewInfo;
}
