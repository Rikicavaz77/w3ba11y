class TextProcessor {
  constructor(doc, treeWalker, useCache = false) {
    this._doc = doc;
    this._root = doc.body;
    this._treeWalker = treeWalker;
    this._cachedTextNodes = null;
    this._useCache = useCache;
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

  get useCache() {
    return this._useCache;
  }

  set useCache(useCache) {
    this._useCache = useCache;
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

  resetCache() {
    this._cachedTextNodes = null;
  }

  getTextNodes() {
    if (this._useCache && this._cachedTextNodes) return this._cachedTextNodes;

    const textNodes = [];
    this._treeWalker.resetWalker();
    let node;
    while ((node = this._treeWalker.nextNode())) {
      textNodes.push(node);
    }

    if (this._useCache) this._cachedTextNodes = textNodes;
    return textNodes;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = TextProcessor;
}
