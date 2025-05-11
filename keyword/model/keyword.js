class Keyword {
  constructor(name, { status = "analyzing", frequency = 0, density = 0, keywordOccurences = null, relevanceScore = 0 } = {}) {
    this._name = name;
    this._status = status;
    this._frequency = frequency;
    this._density = density;
    this._keywordOccurences = keywordOccurences || this.defaultKeywordOccurences();
    this._relevanceScore = relevanceScore;
  }

  defaultKeywordOccurences() {
    return {
      title:      0,
      description:0,
      h1:         0,
      h2:         0,
      h3:         0,
      h4:         0,
      h5:         0,
      h6:         0,
      p:          0,
      a:          0,
      alt:        0,
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

  get keywordOccurences() {
    return this._keywordOccurences;
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

  set keywordOccurences(keywordOccurences) {
    this._keywordOccurences = keywordOccurences;
  }

  calculateDensity(totalWords) {
    return ((this.frequency / Math.max(1, totalWords)) * 100).toFixed(2);
  }

  calculateRelevanceScore(tagData) {
    let score = 0;
    let maxScore = 0;
    Object.entries(this.keywordOccurences).forEach(([tag, occurrences]) => {
      if (tagData[tag].weight && tagData[tag].tagOccurrences > 0) {
        score += (occurrences / tagData[tag].tagOccurrences) * tagData[tag].weight;
        maxScore += tagData[tag].weight;
      }
    });
    this.relevanceScore = Math.ceil((score / maxScore) * 100);
  }
}