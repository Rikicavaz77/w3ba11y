class KeywordController {
  constructor(iframe) {
    this.view = new KeywordView(iframe);
    this.wordCounter = new WordCounter(this.view.iframe.body);
    this.model = null; // Placeholder for the model, to be assigned later
    this.init();
  }

  init() {
    const metaTagKeywordsContent = this.getMetaTagKeywordsContent(this.view.iframe);
    const lang = this.getLang(this.view.iframe);
    const wordCountResult = this.wordCounter.countWords();
    const overviewInfo = {
      wordCount: wordCountResult.totalWords,
      uniqueWordCount: wordCountResult.uniqueWords,
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