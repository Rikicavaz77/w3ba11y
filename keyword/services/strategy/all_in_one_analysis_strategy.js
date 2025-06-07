class AllInOneAnalysisStrategy extends KeywordAnalysisStrategy {
  constructor() {
    super();
    this._ancestorCache = new WeakMap(); 
  }

  setContext(context) {
    this._context = context;
  }

  resetCache() {
    this._ancestorCache = new WeakMap(); 
  }

  _findAncestors(node) {
    if (this._ancestorCache.has(node)) return this._ancestorCache.get(node);

    let current = node.parentNode;
    const ancestors = [];
    while (current && current !== this._context.root) {
      let tagName = current.nodeName.toLowerCase();
      if (this._context.allowedParentTags.includes(tagName)) {
        ancestors.push(current);
      }
      current = current.parentNode;
    }
    
    this._ancestorCache.set(node, ancestors);
    return ancestors;
  }

  _getCommonAncestors(nodes) {
    if (nodes.length === 0) return [];

    const commonAncestors = new Set(this._findAncestors(nodes[0]));

    for (let i = 1; i < nodes.length; i++) {
      if (commonAncestors.size === 0) break;

      const currentAncestors = new Set(this._findAncestors(nodes[i]));

      for (const ancestor of [...commonAncestors]) {
        if (!currentAncestors.has(ancestor)) {
          commonAncestors.delete(ancestor);
        }
      }
    }
    return [...commonAncestors];
  }

  _updateOccurrencesByAncestors(ancestors, keywordOccurrences, occurrences = 1) {
    ancestors.forEach(ancestor => {
      let tagName = ancestor.nodeName.toLowerCase();
      keywordOccurrences[tagName] = (keywordOccurrences[tagName] || 0) + occurrences;
    });
  }

  analyzeSimpleKeyword(textNodes, pattern, keyword) {
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      if (matches.length === 0) return;

      keyword.frequency += matches.length;

      const ancestors = this._findAncestors(node);
      this._updateOccurrencesByAncestors(ancestors, keyword.keywordOccurrences, matches.length);
    });
  } 

  analyzeCompoundKeyword(nodeGroups, pattern, keyword) {
    nodeGroups.forEach(({ nodes, virtualText }) => {
      const matches = [...virtualText.matchAll(pattern)];
      if (matches.length === 0) return;

      keyword.frequency += matches.length;

      matches.forEach(match => {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        const matchedNodes = nodes
          .filter(({ start, end }) => matchEnd > start && matchStart < end)
          .map(({ node }) => node);
        
        const commonAncestors = this._getCommonAncestors(matchedNodes);
        this._updateOccurrencesByAncestors(commonAncestors, keyword.keywordOccurrences);
      });
    });
  } 
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = AllInOneAnalysisStrategy;
}
