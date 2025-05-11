class TagData {
  constructor() {
    this._data = this._createDefaultData();
  }

  _createDefaultData() {
    return {
      title:       this._initTag(10),
      description: this._initTag(6),
      h1:          this._initTag(5),
      h2:          this._initTag(4),
      h3:          this._initTag(3),
      h4:          this._initTag(2),
      h5:          this._initTag(2),
      h6:          this._initTag(2),
      p:           this._initTag(0),
      a:           this._initTag(1.5),
      alt:         this._initTag(2.5)
    }
  }

  _initTag(weight) {
    return {
      keywordOccurrences: 0,
      tagOccurrences: 0,
      weight
    };
  }
} 