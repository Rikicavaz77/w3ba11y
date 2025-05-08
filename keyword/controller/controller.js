class KeywordController {
  constructor(iframe) {
    this.view = new KeywordView(iframe);
    this.eventHandlers = {
      changeTab: this.view.changeTab.bind(this.view),
      toggleTooltip: this.view.toggleTooltip.bind(this.view),
      toggleHighlight: this.toggleHighlight.bind(this),
      updateHighlightColors: this.updateHighlightColors.bind(this)
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
      this.keywordHighlighter.removeHighlight();
    }
  }

  updateHighlightColors(event) {
    const input = event.target;
    const tag = input.dataset.tag;
    const prop = input.dataset.prop;
    const value = input.value;
    this.keywordHighlighter.updateTagColors(tag, prop, value);
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
    this.view.container.addEventListener('change', (event) => {
      if (event.target.matches('input[type="color"][data-highlight]')) {
        this.updateHighlightColors(event);
      }
    });
    this.view.container.addEventListener("mouseover", (event) => {
      if (event.target.closest(".keywords__tooltip-content")) {
        this.view.toggleTooltip(event);
      }
    });
    this.view.container.addEventListener("mouseout", (event) => {
      if (event.target.closest(".keywords__tooltip-content")) {
        this.view.toggleTooltip(event);
      }
    });
  }
}