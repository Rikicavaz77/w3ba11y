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

  get treeWalker() {
    return this._textProcessor.treeWalker;
  }

  _countWordsInTag(tagName, pattern, words) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return;
    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      words.push(...matches);
    });
  }

  _collectWords(forceRefresh = false) {
    if (!forceRefresh && this._cachedWords) return this._cachedWords;

    const pattern = this._textProcessor.getWordsPattern();
    const words = [];
    this.treeWalker.resetWalker();
    let node;
    while ((node = this.treeWalker.nextNode())) {
      const matches = node.nodeValue.toLowerCase().match(pattern) || [];
      words.push(...matches);
    }

    ["title", "description", "alt"].forEach(tagName => {
      this._countWordsInTag(tagName, pattern, words);
    });

    this._cachedWords = words;
    return words;
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
    const baseLang = lang.split('-')[0].toLowerCase();
    let stopwords = this._stopwords[baseLang] || new Set();
    if (baseLang === 'it') {
      stopwords = new Set([...stopwords, ...this._stopwords['en']]);
    }

    const words = this._collectWords();
    const filteredWords = words.filter(word => !stopwords.has(word));
    const wordsMap = this._countOccurrences(filteredWords);
    const relevantWords = [...wordsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, _]) => key);
    return relevantWords;
  }

  findTwoWordsKeywords(lang = 'en') {
    // To-Do
  }
}
