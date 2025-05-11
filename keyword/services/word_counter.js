class WordCounter extends TextProcessor {
  constructor(doc, treeWalker, tagAccessor) {
    super(doc, treeWalker);
    this.tagAccessor = tagAccessor;
  }

  countWordsInTitleTag() {
    const tag = this.tagAccessor.getTag("title");
    
  }

  countWordsInMetaTag() {

  }

  countWords() {
    const pattern = this.getWordsPattern();
    const words = [];
    let node;
    this.treeWalker.resetWalker();
    while ((node = this.treeWalker.nextNode())) {
      const matches = node.nodeValue.toLowerCase().match(pattern) || [];
      words.push(...matches);
    }

    return {
      words,
      totalWords: words.length,
      uniqueWords: new Set(words).size
    };
  }
}