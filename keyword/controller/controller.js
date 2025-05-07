class KeywordController {
  constructor(iframe) {
    this.view = new KeywordView(iframe);
    this.eventHandlers = {
      changeTab: this.view.changeTab.bind(this.view),
      toggleHighlight: this.toggleHighlight.bind(this)
    };
    this.treeWalker = new TreeWalker(iframe.body);
    this.wordCounter = new WordCounter(iframe, this.treeWalker);
    this.keywordHighlighter = new KeywordHighlighter(iframe, this.treeWalker);
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
    this.view.render(overviewInfo, this.keywordHighlighter.colorMap);
    this.buildUIEvents();
    this.setupTabListeners();
  }

  toggleHighlight(event) {
    const keyword = this.view.customKeywordInput?.value.trim();
    if (!keyword || keyword.length === 0) return;
    if (event.target.checked) {
      this.keywordHighlighter.highlightKeyword(keyword);
    } else {
      this.keywordHighlighter.removeHighlight(keyword);
    }
  }

  getMetaTagKeywordsContent(doc) {
    const metaTagKeywordsContent = doc.querySelector("meta[name='keywords' i]")?.content;
    return metaTagKeywordsContent ?? "Missing";
  }

  getLang(doc) {
    const lang = doc.documentElement.lang;
    return lang || 'Missing';
  }

  // SETUP LISTENERS
  setupTabListeners() {
    this.view.tabButtons.forEach(button => {
      button.addEventListener('click', () => this.eventHandlers.changeTab(button));
    });
  }

  buildUIEvents() {
    this.view.keywordHighlightCheckbox.addEventListener("change", this.eventHandlers.toggleHighlight);
    document.getElementById(`highlight-bg-${element}`).addEventListener("change", updateHighlightBg);
    document.getElementById(`highlight-color-${element}`).addEventListener("change", updateHighlightColor);
    document.getElementById(`highlight-border-${element}`).addEventListener("change", updateHighlightBorder);
  }
}