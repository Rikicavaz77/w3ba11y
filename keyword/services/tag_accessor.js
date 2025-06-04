class TagAccessor {
  constructor(doc, useCache = false) {
    this._doc = doc;
    this._cache = {};
    this._useCache = useCache;
    this._tagAccess = {
      title:       { selector: 'title', type: 'single', textSource: 'innerText' },
      description: { selector: 'meta[name="description" i]', type: 'single', textSource: 'content' },
      h1:          { selector: 'h1', type: 'multi', textSource: 'innerText' },
      h2:          { selector: 'h2', type: 'multi', textSource: 'innerText' },
      h3:          { selector: 'h3', type: 'multi', textSource: 'innerText' },
      h4:          { selector: 'h4', type: 'multi', textSource: 'innerText' },
      h5:          { selector: 'h5', type: 'multi', textSource: 'innerText' },
      h6:          { selector: 'h6', type: 'multi', textSource: 'innerText' },
      p:           { selector: 'p', type: 'multi', textSource: 'innerText' },
      strong:      { selector: 'strong', type: 'multi', textSource: 'innerText' },
      em:          { selector: 'em', type: 'multi', textSource: 'innerText' },
      a:           { selector: 'a', type: 'multi', textSource: 'innerText' },
      li:          { selector: 'li', type: 'multi', textSource: 'innerText' },
      alt:         { selector: 'img[alt]', type: 'multi', textSource: 'alt' }
    };
  }

  set doc(doc) {
    this._doc = doc;
  }

  set useCache(useCache) {
    this._useCache = useCache;
  }

  get doc() {
    return this._doc;
  }

  get useCache() {
    return this._useCache;
  }

  resetCache() {
    this._cache = {};
  }

  getTag(tagName) {
    if (this._useCache && this._cache?.[tagName]) return this._cache[tagName];

    const { selector, type } = this._tagAccess[tagName];
    const result = (type === 'multi') ? Array.from(this._doc.querySelectorAll(selector)) : this._doc.querySelector(selector);

    if (this._useCache) this._cache[tagName] = result;
    return result;
  }

  getTagOccurrences(tagName) {
    const { selector, type } = this._tagAccess[tagName];
    if (type === 'multi') {
      return this._doc.querySelectorAll(selector).length;
    } 
    return this._doc.querySelector(selector) ? 1 : 0;
  }

  extractText(tagName, element) {
    const { textSource } = this._tagAccess[tagName];
    const value = 
      element?.[textSource] ??
      (textSource === 'innerText' ? element?.textContent : undefined);
    return value?.toLowerCase() ?? '';
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = TagAccessor;
}
