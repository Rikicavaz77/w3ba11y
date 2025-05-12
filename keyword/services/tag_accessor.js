class TagAccessor {
  constructor(root, useCache = false) {
    this._root = root;
    this._cache = {};
    this._useCache = useCache;
    this._tagAccess = {
      title:      { selector: "title", type: "single", textSource: "innerText" },
      description:{ selector: "meta[name='description' i]", type: "single", textSource: "content" },
      h1:         { selector: "h1", type: "multi", textSource: "innerText" },
      h2:         { selector: "h2", type: "multi", textSource: "innerText" },
      h3:         { selector: "h3", type: "multi", textSource: "innerText" },
      h4:         { selector: "h4", type: "multi", textSource: "innerText" },
      h5:         { selector: "h5", type: "multi", textSource: "innerText" },
      h6:         { selector: "h6", type: "multi", textSource: "innerText" },
      p:          { selector: "p", type: "multi", textSource: "innerText" },
      a:          { selector: "a", type: "multi", textSource: "innerText" },
      alt:        { selector: "img[alt]", type: "multi", textSource: "alt" }
    };
  }

  get useCache() {
    return this._useCache;
  }

  set useCache(useCache) {
    this._useCache = useCache;
  }

  resetCache() {
    this._cache = {};
  }

  getTag(tagName) {
    if (this._useCache && this._cache?.[tagName]) return this._cache[tagName];

    const { selector, type } = this._tagAccess[tagName];
    const result = (type === "multi") ? Array.from(this._root.querySelectorAll(selector)) : this._root.querySelector(selector);

    if (this._useCache) this._cache[tagName] = result;
    return result;
  }

  getTagOccurrences(tagName) {
    const { selector, type } = this._tagAccess[tagName];
    if (type === "multi") {
      return this._root.querySelectorAll(selector).length;
    } 
    return this._root.querySelector(selector) ? 1 : 0;
  }

  extractText(tagName, element) {
    const { textSource } = this._tagAccess[tagName];
    return element?.[textSource]?.toLowerCase() ?? '';
  }
}