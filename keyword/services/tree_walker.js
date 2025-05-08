class TreeWalker {
  constructor(root) {
    this.root = root;
    this.invalidTags = ['script', 'style', 'noscript', 'iframe', 'object', 'textarea', 'button', 'svg'];
    this.walker = this.createTreeWalker();
  }

  createTreeWalker() {
    return document.createTreeWalker(
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

  resetWalker() {
    this.walker.currentNode = this.root;
  }

  nextNode() {
    return this.walker.nextNode();
  }
}