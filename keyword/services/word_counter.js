class WordCounter {
  constructor(textProcessor, tagAccessor) {
    this._textProcessor = textProcessor;
    this._tagAccessor = tagAccessor;
    this._cachedWords = null;
    this._totalWords = 0;
    this._uniqueWords = 0;
    this._stopwords = {
      en: new Set(sw.eng),
      it: new Set(sw.ita),
    };
    this.countWords();
  }

  get totalWords() {
    return this._totalWords;
  }

  get uniqueWords() {
    return this._uniqueWords;
  }

  _getBaseLang(lang) {
    return lang.split('-')[0].toLowerCase();
  }

  _getStopwords(lang, strict = true) {
    const baseLang = this._getBaseLang(lang);
    let stopwords = this._stopwords[baseLang] || new Set();
    if (strict && baseLang !== 'en') {
      stopwords = new Set([...stopwords, ...this._stopwords['en']]);
    }
    return stopwords;
  }

  _collectWordsInTag(tagName, pattern, words) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return;

    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      words.push(...matches);
    });
  }

  _extractCompoundsFromText(text, pattern, compounds, gramSize) {
    const splitPattern = this._textProcessor.getCompoundSplitPattern();
    const tokenBlocks = text.split(splitPattern).filter(Boolean);
    tokenBlocks.forEach(block => {
      const matches = block.match(pattern) || [];
      for (let i = 0; i <= matches.length - gramSize; i++) {
        const compound = matches.slice(i, i + gramSize);
        compounds.push(compound.join(' '));
      }
    });
  }

  _collectCompoundsInTag(tagName, pattern, compounds, gramSize) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return;

    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      this._extractCompoundsFromText(text, pattern, compounds, gramSize);
    });
  }

  _collectWords(forceRefresh = false) {
    if (!forceRefresh && this._cachedWords) return this._cachedWords;

    const pattern = this._textProcessor.getWordsPattern();
    const textNodes = this._textProcessor.getTextNodes();
    const words = [];
    textNodes.forEach(node => {
      const matches = node.nodeValue.toLowerCase().match(pattern) || [];
      words.push(...matches);
    });

    ['title', 'description', 'alt'].forEach(tagName => {
      this._collectWordsInTag(tagName, pattern, words);
    });

    this._cachedWords = words;
    return words;
  }

  _collectCompounds(gramSize) {
    const pattern = this._textProcessor.getWordsPattern();
    const nodeGroups = this._textProcessor.getTextNodeGroups();
    const compounds = [];
    nodeGroups.forEach(({ virtualText }) => {
      const text = virtualText.toLowerCase();
      this._extractCompoundsFromText(text, pattern, compounds, gramSize);
    });
   
    ['title', 'description', 'alt'].forEach(tagName => {
      this._collectCompoundsInTag(tagName, pattern, compounds, gramSize);
    });

    return compounds;
  }

  _countOccurrences(words) {
    const map = new Map();
    words.forEach(word => {
      map.set(word, (map.get(word) || 0) + 1);
    });
    return map;
  }

  resetCache() {
    this._cachedWords = null;
  }

  countWords(forceRefresh = false) {
    const words = this._collectWords(forceRefresh);
    this._totalWords = words.length;
    this._uniqueWords = new Set(words).size;

    return {
      totalWords: this._totalWords,
      uniqueWords: this._uniqueWords
    };
  }

  findOneWordKeywords(lang = 'en') {
    const stopwords = this._getStopwords(lang);
    const words = this._collectWords();
    const filteredWords = words.filter(word => !stopwords.has(word));
    const wordsMap = this._countOccurrences(filteredWords);
    
    const relevantWords = [...wordsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, _]) => key);
    return relevantWords;
  }

  findCompoundKeywords(lang = 'en', gramSize = 2) {
    const mainStopwords = this._getStopwords(lang, false);
    let secondaryStopwords;
    if (this._getBaseLang(lang) !== 'en') {
      secondaryStopwords = this._getStopwords('en', false);
    }

    const compounds = this._collectCompounds(gramSize);
    const filteredWords = compounds.filter(compound => {
      const words = compound.split(' ');
      return words.every(word => !mainStopwords.has(word)) &&
      (!secondaryStopwords || words.filter(word => secondaryStopwords.has(word)).length <= gramSize / 2);
    });

    const wordsMap = this._countOccurrences(filteredWords);
    const relevantWords = [...wordsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, _]) => key);
    return relevantWords;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = WordCounter;
}
