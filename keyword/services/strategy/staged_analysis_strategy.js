class StagedAnalysisStrategy extends KeywordAnalysisStrategy {
  setContext(context) {
    this._context = context;
  }

  resetCache() {}

  _updateOccurrencesByTags(pattern, keywordOccurrences) {
    this._context.allowedParentTags.forEach(tagName => {
      const count = this._context.countOccurrencesInTag(tagName, pattern);
      keywordOccurrences[tagName] = (keywordOccurrences[tagName] || 0) + count;
    });
  }

  analyzeSimpleKeyword(textNodes, pattern, keyword) {
    textNodes.forEach(node => {
      const matches = node.nodeValue.match(pattern) || [];
      keyword.frequency = (keyword.frequency || 0) + matches.length;
    });

    this._updateOccurrencesByTags(pattern, keyword.keywordOccurrences);
  } 

  analyzeCompoundKeyword(nodeGroups, pattern, keyword) {
    nodeGroups.forEach(({ virtualText }) => {
      const matches = virtualText.match(pattern) || [];
      keyword.frequency = (keyword.frequency || 0) + matches.length;
    });

    this._updateOccurrencesByTags(pattern, keyword.keywordOccurrences);
  } 
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = StagedAnalysisStrategy;
}
