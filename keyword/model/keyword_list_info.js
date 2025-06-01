class KeywordListInfo {
  constructor(type, title, keywords, totalPages, sortDirection = null) {
    this._type = type;
    this._title = title;
    this._keywords = keywords;
    this._totalPages = totalPages;
    this._sortDirection = sortDirection;
  } 

  get type() {
    return this._type;
  }

  get title() {
    return this._title;
  }

  get keywords() {
    return this._keywords;
  }

  get totalPages() {
    return this._totalPages;
  }

  get sortDirection() {
    return this._sortDirection;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordListInfo;
}
