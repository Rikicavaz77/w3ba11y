class TagAccessor {
  constructor(doc, useCache = false) {
    this._doc = doc;
    this._cache = {};
    this._useCache = useCache;
    this._tagAccess = {
      title:       { selector: 'title', type: 'single', textSource: 'textContent' },
      description: { selector: 'meta[name="description" i]', type: 'single', textSource: 'content' },
      h1:          { selector: 'h1', type: 'multi', textSource: 'textContent' },
      h2:          { selector: 'h2', type: 'multi', textSource: 'textContent' },
      h3:          { selector: 'h3', type: 'multi', textSource: 'textContent' },
      h4:          { selector: 'h4', type: 'multi', textSource: 'textContent' },
      h5:          { selector: 'h5', type: 'multi', textSource: 'textContent' },
      h6:          { selector: 'h6', type: 'multi', textSource: 'textContent' },
      p:           { selector: 'p', type: 'multi', textSource: 'textContent' },
      strong:      { selector: 'strong', type: 'multi', textSource: 'textContent' },
      em:          { selector: 'em', type: 'multi', textSource: 'textContent' },
      a:           { selector: 'a', type: 'multi', textSource: 'textContent' },
      li:          { selector: 'li', type: 'multi', textSource: 'textContent' },
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
    if (this._useCache && tagName in this._cache) return this._cache[tagName];

    const tagConfig = this._tagAccess[tagName];
    if (!tagConfig) return;

    const { selector, type } = tagConfig;
    const result = (type === 'multi') 
      ? Array.from(this._doc.querySelectorAll(selector)) 
      : this._doc.querySelector(selector);

    if (this._useCache) this._cache[tagName] = result;
    return result;
  }

  getTagOccurrences(tagName) {
    const tagConfig = this._tagAccess[tagName];
    if (!tagConfig) return 0;

    const { selector, type } = tagConfig;
    return (type === 'multi') 
      ? this._doc.querySelectorAll(selector).length
      : this._doc.querySelector(selector) ? 1 : 0;
  }

  extractText(tagName, element) {
    const tagConfig = this._tagAccess[tagName];
    if (!tagConfig) return '';

    const { textSource } = tagConfig;
    const value = element?.[textSource];
    return value?.toLowerCase() ?? '';
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = TagAccessor;
}
