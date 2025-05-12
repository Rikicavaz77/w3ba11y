class TreeWalker {
  constructor(root) {
    this._root = root;
    this._invalidTags = ['script', 'style', 'noscript', 'iframe', 'object', 'textarea', 'button', 'svg'];
    this._walker = this.createTreeWalker();
  }

  createTreeWalker() {
    return document.createTreeWalker(
      this._root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType !== Node.TEXT_NODE) {
            if (this._invalidTags.includes(node.nodeName.toLowerCase())) {
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
    this._walker.currentNode = this._root;
  }

  nextNode() {
    return this._walker.nextNode();
  }
}