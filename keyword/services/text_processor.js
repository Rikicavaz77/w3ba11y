class TextProcessor {
  constructor(doc, treeWalker) {
    this._doc = doc;
    this._root = doc.body;
    this._treeWalker = treeWalker;
    this._allowedParentTags = ['p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'li'];
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
    while (current && current !== this.root) {
      if (this.allowedParentTags.includes(current.nodeName.toLowerCase())) {
        return current.nodeName;
      }
      current = current.parentNode;
    }
    return this.root.nodeName;
  }

  getWordsPattern() {
    return /[\p{L}\p{N}]+(?:['’\-_.][\p{L}\p{N}]+)*/gu;
  }

  getKeywordPattern(keyword, flags = 'giu') {
    return new RegExp(`(?<![\\p{L}\\p{N}]|[\\p{L}\\p{N}]['’\-_.])${Utils.escapeRegExp(keyword)}(?![\\p{L}\\p{N}]|['’\-_.][\\p{L}\\p{N}])`, flags);
  }

  getTextNodes() {
    const textNodes = [];
    let node;
    this.treeWalker.resetWalker();
    while ((node = this.treeWalker.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }
}