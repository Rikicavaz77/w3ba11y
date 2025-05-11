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

  countOccurrencesInSingleTag(tagName, pattern) {
    const tags = this.doc.querySelectorAll(`${tagName}`);
    result[tagName] = { tagOccurrences: tags.length };
    tags.forEach(tag => {
      const tagContent = tag.innerText;
      const matches = tagContent.match(pattern) || [];
      result[tagName].keywordOccurrences += matches.length;
    });
    return result;
  }

  countOccurrencesInMetaTag(tagName, pattern) {
    const result = {};
    const tag = this.doc.querySelector(`meta[name='${tagName}' i]`);
    result[tagName] = { tagOccurrences: tag ? 1 : 0 };
    const tagContent = tag?.content;
    if (tagContent) {
      const matches = tagContent.match(this.pattern) || [];
      result[tagName].keywordOccurrences = matches.length;
    }
    return result;
  } 

  countOccurrencesInAltAttribute(pattern) {
    const result = {};
    const tags = this.doc.querySelectorAll("img[alt]");
    tags.forEach((tag) => {
      const tagContent = tag.alt;
      const matches = tagContent.match(pattern) || [];
      result.alt.keywordOccurrences += matches.length;
    });
    return result;
  } 
}