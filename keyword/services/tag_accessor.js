class TagAccessor {
  constructor(doc, useCache = false) {
    this.doc = doc;
    this.cache = {};
    this.useCache = useCache;
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

  resetCache() {
    this.cache = {};
  }

  getTag(tagName) {
    if (this.useCache && this.cache?.[tagName]) return this.cache[tagName];

    const { selector, type } = this._tagAccess[tagName];
    const result = (type === "multi") ? Array.from(this.doc.querySelectorAll(selector)) : this.doc.querySelector(selector);

    if (this.useCache) this.cache[tagName] = result;
    return result;
  }

  extractText(tagName, element) {
    const { textSource } = this._tagAccess[tagName];
    return element?.[textSource]?.toLowerCase() ?? '';
  }
}