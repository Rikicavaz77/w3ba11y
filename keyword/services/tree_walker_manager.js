class TreeWalkerManager {
  constructor(root) {
    this._root = root;
    this._invalidTags = ['script', 'style', 'noscript', 'iframe', 'object', 'textarea', 'button', 'svg'];
    this.createTreeWalker();
  }

  set root(root) {
    this._root = root;
  }

  get root() {
   return  this._root;
  }

  createTreeWalker() {
    this._walker = document.createTreeWalker(
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

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = TreeWalkerManager;
}
