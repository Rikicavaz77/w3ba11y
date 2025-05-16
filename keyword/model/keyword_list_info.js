class KeywordListInfo {
  constructor(title, type, keywords, totalPages) {
    this._title = title;
    this._type = type;
    this._keywords = keywords;
    this._totalPages = totalPages;
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
}
