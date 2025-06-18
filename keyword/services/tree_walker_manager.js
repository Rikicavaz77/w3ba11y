class TreeWalkerManager {
  constructor(doc) {
    this._doc = doc;
    this._root = doc.body;
    this._invalidTags = [
      'script', 'style', 'noscript', 'iframe', 'object', 'textarea', 
      'button', 'svg', 'canvas', 'select', 'option', 'input',
      'track', 'source', 'audio', 'video'
    ];
    this.createTreeWalker();
  }

  set doc(doc) {
    this._doc = doc;
  }

  set root(root) {
    this._root = root;
  }

  get doc() {
    return this._doc;
   }

  get root() {
   return this._root;
  }

  createTreeWalker() {
    this._walker = this._doc.createTreeWalker(
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
