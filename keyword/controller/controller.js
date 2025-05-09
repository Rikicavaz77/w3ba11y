class KeywordController {
  constructor(iframe) {
    this.batchSizes = {
      meta: 5
    };
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
    this.metaKeywords = [];
    this.displayMetaKeywords = [];
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
    if (this.displayMetaKeywords.length > 0) {
      const metaKeywordsData = this.displayMetaKeywords.slice(0, this.batchSizes.meta);
      const totalPages = Math.ceil(this.displayMetaKeywords.length / this.batchSizes.meta);
      this.view.renderMetaTagKeywordsContainer(metaKeywordsData, totalPages);
    }
    this.buildUIEvents();
    this.setupTabListeners();
  }

  // CHANGE PAGE FUNCTION
  changePage(listType, page) {
    const listView = this.view.getListViewByType(listType);
    if (!listView || listView.isCurrentPage(page)) return;
    const keywordsList = this.getListByType(listType).display;
    let start = (page - 1) * this.batchSizes[listType];
    let end = start + this.batchSizes[listType];
    const keywordsData = keywordsList.slice(start, end);
    const totalPages = Math.ceil(keywordsList.length / this.batchSizes[listType]);
    listView.changePage(keywordsData, totalPages, page, start);
  }

  // SORT FUNCTION 
  sortKeywords(listType, clickedButton) {
    const sortDirection = clickedButton.dataset.sort;
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;
    listView.updateSortButtons(clickedButton);
    const keywordsList = this.getListByType(listType).display;
    keywordsList.sort((a, b) => {
      const compare = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return (sortDirection === "asc") ? compare : -compare;
    });
    let start = (listView.currentPage - 1) * this.batchSizes[listType];
    let end = start + this.batchSizes[listType];
    const keywordsData = keywordsList.slice(start, end);
    const totalPages = Math.ceil(keywordsList.length / this.batchSizes[listType]);
    listView.render(keywordsData, totalPages, listView.currentPage, start);
  }

  // REMOVE FILTERS
  removeFilters(listType) {
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;
    const { original, display } = this.getListByType(listType);
    display.splice(0, display.length, ...original);
    listView.removeFilters();
    let start = (listView.currentPage - 1) * this.batchSizes[listType];
    let end = start + this.batchSizes[listType];
    const keywordsData = display.slice(start, end);
    const totalPages = Math.ceil(display.length / this.batchSizes[listType]);
    listView.render(keywordsData, totalPages, listView.currentPage, start);
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

  getListByType(listType) {
    switch (listType) {
      case 'meta':
        return {
          original: this.metaKeywords,
          display: this.displayMetaKeywords
        };
      default:
        return null;
    }
  }

  getMetaTagKeywordsContent(doc) {
    const metaTagKeywordsContent = doc.querySelector("meta[name='keywords' i]")?.content;
    if (metaTagKeywordsContent) {
      const keywords = metaTagKeywordsContent.split(',');
      this.metaKeywords = keywords
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .map(keyword => new Keyword(keyword));
      this.displayMetaKeywords = [...this.metaKeywords];
    }
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
    this.view.container.addEventListener('click', (event) => {
      let button = event.target.closest(".keyword-button--highlight");
      if (button) {
        const listItem = event.target.closest(".keyword-list-item");
        const keywordsListContainer = event.target.closest(".keyword-list__container");
        if (!listItem || !keywordsListContainer) return;
        const keywordsList = this.getListByType(keywordsListContainer.dataset.listType).display;
        const keywordIndex = parseInt(listItem.dataset.keywordIndex, 10);
        if (isNaN(keywordIndex)) return;
        this.keywordHighlighter.highlightKeyword(keywordsList[keywordIndex].name);
        return;
      }

      button = event.target.closest(".keywords__pagination__button");
      if (button) {
        const keywordsListContainer = event.target.closest(".keyword-list__container");
        if (!keywordsListContainer) return;
        const listType = keywordsListContainer.dataset.listType;
        const page = parseInt(button.dataset.page, 10);
        this.changePage(listType, page);
        return;
      }

      button = event.target.closest(".keywords__sort-button");
      if (button) {
        const keywordsListContainer = event.target.closest(".keyword-list__container");
        if (!keywordsListContainer) return;
        const listType = keywordsListContainer.dataset.listType;
        this.sortKeywords(listType, button);
        return;
      }

      button = event.target.closest(".keywords__remove-filters");
      if (button) {
        const keywordsListContainer = event.target.closest(".keyword-list__container");
        if (!keywordsListContainer) return;
        const listType = keywordsListContainer.dataset.listType;
        this.removeFilters(listType);
        return;
      }
    });
    /* this.view.container.addEventListener("mouseover", (event) => {
      if (event.target.closest(".keywords__tooltip-content")) {
        this.view.toggleTooltip(event);
      }
    });
    this.view.container.addEventListener("mouseout", (event) => {
      if (event.target.closest(".keywords__tooltip-content")) {
        this.view.toggleTooltip(event);
      }
    }); */
    const tooltips = this.view.tooltips;
    tooltips.forEach(tooltip => {
      tooltip.addEventListener("mouseover", this.eventHandlers.toggleTooltip);
    });
    tooltips.forEach(tooltip => {
      tooltip.addEventListener("mouseout", this.eventHandlers.toggleTooltip);
    });
  }
}
