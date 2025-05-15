class OverviewInfo {
  constructor(wordCount, uniqueWordCount, metaTagKeywordsContent, lang) {
    this._wordCount = wordCount;
    this._uniqueWordCount = uniqueWordCount;
    this._metaTagKeywordsContent = metaTagKeywordsContent;
    this._lang = lang;
  } 

  get wordCount() {
    return this._wordCount;
  }

  get uniqueWordCount() {
    return this._uniqueWordCount;
  }

  get metaTagKeywordsContent() {
    return this._metaTagKeywordsContent;
  }

  get lang() {
    return this._lang;
  }
}