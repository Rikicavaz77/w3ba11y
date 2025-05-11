class WordCounter extends TextProcessor {
  constructor(doc, treeWalker, tagAccessor) {
    super(doc, treeWalker);
    this.tagAccessor = tagAccessor;
  }

  countWordsInTag(tagName, pattern, words) {
    let tags = this.tagAccessor.getTag(tagName);
    if (!tags) return;
    tags = Array.isArray(tags) ? tags : [tags];
    tags.forEach(tag => {
      const text = this.extractText(tagName, tag);
      const matches = text.match(pattern) || [];
      words.push(...matches);
    })
  }

  countWords() {
    const pattern = this.getWordsPattern();
    const words = [];
    this.treeWalker.resetWalker();
    let node;
    while ((node = this.treeWalker.nextNode())) {
      const matches = node.nodeValue.toLowerCase().match(pattern) || [];
      words.push(...matches);
    }
    ["title", "description", "alt"].forEach(tag => {
      this.countWordsInTag(tagName, pattern, words);
    });

    return {
      words,
      totalWords: words.length,
      uniqueWords: new Set(words).size
    };
  }
}