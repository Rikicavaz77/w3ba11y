class Keyword {
  constructor(name, status = "analyzing") {
    this._name = name;
    this._status = status;
    this._frequency = 0;
    this._density = 0;
    this._tagData = {
      title:      { keywordOccurrences: 0, weight: 10, tagOccurrences: 0 },
      description:{ keywordOccurrences: 0, weight: 6, tagOccurrences: 0 },
      keywords:   { keywordOccurrences: 0, weight: 0, tagOccurrences: 0 },
      h1:         { keywordOccurrences: 0, weight: 5, tagOccurrences: 0 },
      h2:         { keywordOccurrences: 0, weight: 4, tagOccurrences: 0 },
      h3:         { keywordOccurrences: 0, weight: 3, tagOccurrences: 0 },
      h4:         { keywordOccurrences: 0, weight: 2, tagOccurrences: 0 },
      h5:         { keywordOccurrences: 0, weight: 2, tagOccurrences: 0 },
      h6:         { keywordOccurrences: 0, weight: 2, tagOccurrences: 0 },
      p:          { keywordOccurrences: 0, weight: 0, tagOccurrences: 0 },
      a:          { keywordOccurrences: 0, weight: 1.5, tagOccurrences: 0 },
      alt:        { keywordOccurrences: 0, weight: 2.5, tagOccurrences: 0 }
    };
    this.__relevanceScore = 0;
  }

  get name() {
    return this._name;
  }

  get frequency() {
    return this._frequency;
  }
}