class Keyword {
  constructor(name, { status = "analyzing", frequency = 0, density = 0, tagData = null, relevanceScore = 0 } = {}) {
    this._name = name;
    this._status = status;
    this._frequency = frequency;
    this._density = density;
    this._tagData = tagData || this.defaultTagData();
    this._relevanceScore = relevanceScore;
  }

  defaultTagData() {
    return {
      title:      { keywordOccurrences: 0, weight: 10, tagOccurrences: 0 },
      description:{ keywordOccurrences: 0, weight: 6, tagOccurrences: 0 },
      h1:         { keywordOccurrences: 0, weight: 5, tagOccurrences: 0 },
      h2:         { keywordOccurrences: 0, weight: 4, tagOccurrences: 0 },
      h3:         { keywordOccurrences: 0, weight: 3, tagOccurrences: 0 },
      h4:         { keywordOccurrences: 0, weight: 2, tagOccurrences: 0 },
      h5:         { keywordOccurrences: 0, weight: 2, tagOccurrences: 0 },
      h6:         { keywordOccurrences: 0, weight: 2, tagOccurrences: 0 },
      p:          { keywordOccurrences: 0, weight: 0, tagOccurrences: 0 },
      a:          { keywordOccurrences: 0, weight: 1.5, tagOccurrences: 0 },
      alt:        { keywordOccurrences: 0, weight: 2.5, tagOccurrences: 0 }
    }
  }

  get name() {
    return this._name;
  }

  get status() {
    return this._status;
  }

  get frequency() {
    return this._frequency;
  }

  get density() {
    return this._density;
  }

  get tagData() {
    return this._tagData;
  }

  get relevanceScore() {
    return this._relevanceScore;
  }

  set name(name) {
    this._name = name;
  }

  set status(status) {
    this._status = status;
  }

  set density(density) {
    this._density = density;
  }

  set tagData(tagData) {
    this._tagData = tagData;
  }

  calculateRelevanceScore() {
    let score = 0;
    let maxScore = 0;
    Object.entries(this.tagData).forEach(([_, data]) => {
      if (data.weight && data.tagOccurrences > 0) {
        score += (data.keywordOccurrences / data.tagOccurrences) * data.weight;
        maxScore += data.weight;
      }
    });
    this.relevanceScore = Math.ceil((score / maxScore) * 100);
  }
}