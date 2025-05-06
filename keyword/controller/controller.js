class KeywordController {
  constructor(iframe) {
    this.view = new KeywordView(iframe);
    this.model = null; // Placeholder for the model, to be assigned later
    this.init();
  }

  init() {
    const metaTagKeywordsContent = this.getMetaTagKeywordsContent(this.view.iframe);
    const lang = this.getLang(this.view.iframe);
    const overviewInfo = {
      wordCount: 2300,
      uniqueWordCount: 1000,
      metaTagKeywordsContent: metaTagKeywordsContent,
      lang: lang
    };
    this.view.render(overviewInfo);
  }

  getMetaTagKeywordsContent(doc) {
    const metaTagKeywordsContent = doc.querySelector("meta[name='keywords' i]")?.content;
    return metaTagKeywordsContent ?? "Missing";
  }

  getLang(doc) {
    const lang = doc.documentElement.lang;
    return lang || 'Missing';
  }
}