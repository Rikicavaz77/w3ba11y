class TextProcessor {
  constructor(doc, treeWalker) {
    this.doc = doc;
    this.root = doc.body;
    this.treeWalker = treeWalker;
    this.allowedParentTags = ['p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'li'];
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
    return /[\p{L}\p{N}]+(?:['’\-_.][\p{L}\p{N}]+)*['’]?/gu;
  }

  getKeywordPattern(keyword, flags = 'giu') {
    return new RegExp(`(?<![\\p{L}\\p{N}]|[\\p{L}\\p{N}][\-_.])${Utils.escapeRegExp(keyword)}(?![\\p{L}\\p{N}]|[\-_.][\\p{L}\\p{N}])`, flags);
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

  countTagOccurrences() {
    
  }
}