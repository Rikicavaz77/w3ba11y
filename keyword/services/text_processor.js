class TextProcessor {
  constructor(doc, treeWalker) {
    this._doc = doc;
    this._root = doc.body;
    this._treeWalker = treeWalker;
    this._allowedParentTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'a', 'li'];
  }

  get doc() {
    return this._doc;
  }

  get root() {
    return this._root;
  }

  get treeWalker() {
    return this._treeWalker;
  }

  get allowedParentTags() {
    return this._allowedParentTags;
  }

  getParentName(node) {
    let current = node.parentNode;
    while (current && current !== this._root) {
      if (this._allowedParentTags.includes(current.nodeName.toLowerCase())) {
        return current.nodeName;
      }
      current = current.parentNode;
    }
    return this._root.nodeName;
  }

  getWordsPattern() {
    return /[\p{L}\p{N}]+(?:[’'_.-][\p{L}\p{N}]+)*/gu;
  }

  getKeywordPattern(keyword, { capture = false, flags = 'giu' } = {}) {
    if (capture) {
      return new RegExp(`(?<![\\p{L}\\p{N}]|[\\p{L}\\p{N}][’'_.-])(${Utils.escapeRegExp(keyword)})(?![\\p{L}\\p{N}]|[’'_.-][\\p{L}\\p{N}])`, flags);
    }
    return new RegExp(`(?<![\\p{L}\\p{N}]|[\\p{L}\\p{N}][’'_.-])${Utils.escapeRegExp(keyword)}(?![\\p{L}\\p{N}]|[’'_.-][\\p{L}\\p{N}])`, flags);
  }

  getTextNodes() {
    const textNodes = [];
    this._treeWalker.resetWalker();
    let node;
    while ((node = this._treeWalker.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }
}

// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = TextProcessor;
}
