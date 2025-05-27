class Keyword {
  constructor(name, { status = "analyzing", frequency = 0, density = 0, keywordOccurrences = null, relevanceScore = 0 } = {}) {
    this._name = name;
    this._status = status;
    this._frequency = frequency;
    this._density = density;
    this._keywordOccurrences = keywordOccurrences || this._defaultKeywordOccurrences();
    this._relevanceScore = relevanceScore;
  }

  _defaultKeywordOccurrences() {
    return {
      title:       0,
      description: 0,
      h1:          0,
      h2:          0,
      h3:          0,
      h4:          0,
      h5:          0,
      h6:          0,
      p:           0,
      strong:      0,
      em:          0,
      a:           0,
      li:          0,
      alt:         0
    };
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

  get keywordOccurrences() {
    return this._keywordOccurrences;
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

  set frequency(frequency) {
    this._frequency = frequency;
  }

  set keywordOccurrences(keywordOccurrences) {
    this._keywordOccurrences = keywordOccurrences;
  }

  calculateDensity(totalWords) {
    this._density = parseFloat(((this._frequency / Math.max(1, totalWords)) * 100).toFixed(2));
  }

  calculateRelevanceScore(tagData) {
    let score = 0;
    let maxScore = 0;
    Object.entries(this.keywordOccurrences).forEach(([tag, occurrences]) => {
      if (tagData[tag] && tagData[tag].weight && tagData[tag].tagOccurrences > 0) {
        score += (occurrences / tagData[tag].tagOccurrences) * tagData[tag].weight;
        maxScore += tagData[tag].weight;
      }
    });
    this._relevanceScore = maxScore === 0 ? 0 : Math.ceil((score / maxScore) * 100);
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Keyword;
}
