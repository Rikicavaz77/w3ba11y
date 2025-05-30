class KeywordListInfo {
  constructor(title, type, keywords, totalPages, sortDirection = null) {
    this._title = title;
    this._type = type;
    this._keywords = keywords;
    this._totalPages = totalPages;
    this._sortDirection = sortDirection;
  } 

  get title() {
    return this._title;
  }

  get type() {
    return this._type;
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
