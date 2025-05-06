class WordCounter {
  constructor(root) {
    this.root = root;
    this.invalidTags = ['script', 'style', 'noscript', 'iframe', 'object', 'textarea', 'button', 'svg'];
    this.createTreeWalker();
  }

  isAllParentsValid(node) {
    let current = node.parentNode;
    while (current && current !== this.root) {
      if (this.invalidTags.includes(current.nodeName.toLowerCase())) {
        return false;
      }
      current = current.parentNode;
    }
    return true;
  }

  createTreeWalker() {
    this.walker = document.createTreeWalker(
      this.root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!this.isAllParentsValid(node)) return NodeFilter.FILTER_REJECT;
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