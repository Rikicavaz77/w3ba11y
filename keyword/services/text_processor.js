class TextProcessor {
  constructor(doc, treeWalker) {
    this._doc = doc;
    this._root = doc.body;
    this._treeWalker = treeWalker;
    this._allowedParentTags = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'a', 'li'
    ];
    this.allowedInlineTags = [
      'strong', 'em', 'b', 'i', 'u', 'span', 'mark', 'small', 'sup', 'sub', 'abbr'
    ];
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

  isValidInlineElement(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;

    const tag = node.nodeName.toLowerCase();
    const display = window.getComputedStyle(node).display;

    if (!display.startsWith("inline")) return false;

   return this.allowedInlineTags.includes(tag);
  }

  getBlockParent(node) {
    let current = node.parentNode;
    while(current && current !== this.root) {
      if (!this.isValidInlineElement(current)) {
        return current;
      }
      current = current.parentNode;
    }
    return this._root;
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

  getTextNodeGroups() {
    const nodeGroups = [];
    let currentGroup = [];
    let currentBlockParent = null;
    let virtualText = null;
    this._treeWalker.resetWalker();
    let node;
    while ((node = this._treeWalker.nextNode())) {
      const parent = this.getBlockParent(node);
      if (currentBlockParent === parent) {
        const start = virtualText.length;
        virtualText += node.nodeValue;
        const end = virtualText.length;
        currentGroup.push({ node, start, end});
      } else {
        if (currentGroup.length > 0) {
          nodeGroups.push({ nodes: currentGroup, virtualText, parent: currentBlockParent});
        }
        virtualText = "";
        const start = virtualText.length;
        virtualText += node.nodeValue;
        const end = virtualText.length;
        currentGroup = [{ node, start, end}];
        currentBlockParent = parent;
      }
    }
    if (currentGroup.length > 0) {
      nodeGroups.push({ nodes: currentGroup, virtualText, parent: currentBlockParent});
    }

    return nodeGroups;
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
