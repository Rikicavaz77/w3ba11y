class WordCounter {
  constructor(textProcessor, tagAccessor) {
    this._textProcessor = textProcessor;
    this._tagAccessor = tagAccessor;
    this._totalWords = 0;
    this._uniqueWords = 0;
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

  countWordsInTag(tagName, pattern, words) {
    let tags = this._tagAccessor.getTag(tagName);
    if (!tags) return;
    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(tag => {
      const text = this._tagAccessor.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      words.push(...matches);
    })
  }

  countWords() {
    const pattern = this._textProcessor.getWordsPattern();
    const words = [];
    this.treeWalker.resetWalker();
    let node;
    while ((node = this.treeWalker.nextNode())) {
      const matches = node.nodeValue.toLowerCase().match(pattern) || [];
      words.push(...matches);
    }
    ["title", "description", "alt"].forEach(tagName => {
      this.countWordsInTag(tagName, pattern, words);
    });

    this._totalWords = words.length;
    this._uniqueWords = new Set(words).size;

    return {
      totalWords: this._totalWords,
      uniqueWords: this._uniqueWords
    };
  }
}