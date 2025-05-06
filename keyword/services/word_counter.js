class WordCounter {
  constructor(root) {
    this.root = root;
    this.invalidTags = ['script', 'style', 'noscript', 'iframe', 'object', 'textarea', 'button', 'svg'];
    this.createTreeWalker();
  }
  
  createTreeWalker() {
    this.walker = document.createTreeWalker(
      this.root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType !== Node.TEXT_NODE) {
            if (this.invalidTags.includes(node.nodeName.toLowerCase())) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_SKIP;
          }
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
  }

  getPattern() {
    return /[\p{L}\p{N}]+(?:['’\-_.][\p{L}\p{N}]+)*['’]?/gu;
  }

  countWords() {
    const pattern = this.getPattern();
    const words = [];
    let node;
    this.walker.currentNode = this.root;
    while ((node = this.walker.nextNode())) {
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