class TagAccessor {
  constructor(doc, useCache = false) {
    this.doc = doc;
    this.cache = {};
    this.useCache = useCache;
    this._tagAccess = {
      title:      { selector: "title", type: "single" },
      description:{ selector: "meta[name='description' i]", type: "single" },
      h1:         { selector: "h1", type: "multi" },
      h2:         { selector: "h2", type: "multi" },
      h3:         { selector: "h3", type: "multi" },
      h4:         { selector: "h4", type: "multi" },
      h5:         { selector: "h5", type: "multi" },
      h6:         { selector: "h6", type: "multi" },
      p:          { selector: "p", type: "multi" },
      a:          { selector: "a", type: "multi" },
      alt:        { selector: "img[alt]", type: "multi" }
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
}