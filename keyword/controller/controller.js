class KeywordController {
  constructor(iframe) {
    this.batchSizes = {
      meta: 5,
      userAdded: 5
    };
    this.view = new KeywordView(iframe);
    this.eventHandlers = {
      changeTab: this.view.changeTab.bind(this.view),
      toggleTooltip: this.view.toggleTooltip.bind(this.view),
      toggleHighlight: this.toggleHighlight.bind(this),
      updateHighlightColors: this.updateHighlightColors.bind(this),
      analyzeKeyword: this.analyzeKeyword.bind(this)
    };
    const treeWalker = new TreeWalker(iframe.body);
    const textProcessor = new TextProcessor(iframe, treeWalker);
    const tagAccessor = new TagAccessor(iframe);
    this.wordCounter = new WordCounter(textProcessor, tagAccessor);
    this.keywordAnalyzer = new KeywordAnalyzer(textProcessor, tagAccessor, this.wordCounter, new StagedAnalysisStrategy());
    this.keywordHighlighter = new KeywordHighlighter(textProcessor);
    this.metaKeywords = [];
    this.displayMetaKeywords = [];
    this.userKeywords = [];
    this.displayUserKeywords = [];
    this.init();
  }

  init() {
    const wordCountResult = this.wordCounter.countWords();
    const metaTagKeywordsContent = this.getMetaTagKeywordsContent(this.view.iframe);
    const lang = this.getLang(this.view.iframe);
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
      this.view.renderKeywordListContainer(new KeywordListInfo(
        "Meta keywords",
        "meta",
        metaKeywordsData,
        totalPages
      ));
    }
    this.buildUIEvents();
    this.setupTabListeners();
  }

  renderPage(listType, listView, keywordsList, currentPage) {
    let start = (currentPage - 1) * this.batchSizes[listType];
    let end = start + this.batchSizes[listType];
    const keywordsData = keywordsList.slice(start, end);
    const totalPages = Math.ceil(keywordsList.length / this.batchSizes[listType]);
    listView.render(keywordsData, totalPages, currentPage, start);
  }

  // CHANGE PAGE FUNCTION
  changePage(listType, currentPage) {
    const listView = this.view.getListViewByType(listType);
    if (!listView || listView.isCurrentPage(currentPage)) return;
    const { display } = this.getListByType(listType);
    this.renderPage(listType, listView, display, currentPage);
    listView.scrollToPagination();
  }

  // SORT FUNCTION 
  sortKeywords(keywords, sortDirection) {
    keywords.sort((a, b) => {
      const compare = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return (sortDirection === "asc") ? compare : -compare;
    });
  }

  // HANDLE SORTING FUNCTION
  handleKeywordSorting(listType, clickedButton) {
    const sortDirection = clickedButton.dataset.sort;
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;
    const { display } = this.getListByType(listType);
    this.sortKeywords(display, sortDirection);
    listView.updateSortButtons(clickedButton);
    this.renderPage(listType, listView, display, listView.currentPage);
  }

  // SEARCH FUNCTION
  filterKeywords(keywords, filterQuery) {
    const pattern = new RegExp(`${Utils.escapeRegExp(filterQuery)}`, "i");
    const filteredKeywords = keywords.filter((keywordItem) => {
      return pattern.test(keywordItem.name);
    });
    return filteredKeywords;
  }

  // UPDATE VISIBLE KEYWORDS FUNCTION
  updateVisibleKeywords(listType, filterQuery) {
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;
    const { original, display } = this.getListByType(listType);
    const result = filterQuery ? this.filterKeywords(original, filterQuery) : [...original];

    if (listView.sortDirection) {
      this.sortKeywords(result, listView.sortDirection);
    }

    display.splice(0, display.length, ...result);
    this.renderPage(listType, listView, display, listView.currentPage);
  }

  // REMOVE FILTERS
  removeFilters(listType) {
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;
    const { original, display } = this.getListByType(listType);
    display.splice(0, display.length, ...original);
    listView.removeFilters();
    this.renderPage(listType, listView, display, listView.currentPage);
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
      case 'userAdded':
          return {
            original: this.userKeywords,
            display: this.displayUserKeywords
          };
      default:
        return null;
    }
  }

  getMetaTagKeywordsContent(doc) {
    const metaTagKeywordsContent = doc.querySelector("meta[name='keywords' i]")?.content;
    if (metaTagKeywordsContent) {
      let keywords = metaTagKeywordsContent.split(',');
      this.metaKeywords = keywords
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .map(keyword => new Keyword(keyword));
      this.keywordAnalyzer.analyzeKeywords(this.metaKeywords, this.wordCounter.totalWords);
      this.displayMetaKeywords = [...this.metaKeywords];
    }
    return metaTagKeywordsContent ?? "Missing";
  }

  getLang(doc) {
    const lang = doc.documentElement.lang;
    return lang || 'Missing';
  }

  analyzeKeyword() {
    const keyword = this.view.customKeywordInput?.value.trim();
    if (!keyword || keyword.length === 0) return; 
    const keywordItem = new Keyword(keyword);
    this.userKeywords.push(keywordItem);
    if (this.userKeywords.length === 1) {
      this.displayUserKeywords.push(keywordItem);
      const userKeywordsData = this.displayUserKeywords.slice(0, this.batchSizes.userAdded);
      const totalPages = Math.ceil(this.displayUserKeywords.length / this.batchSizes.userAdded);
      this.view.renderKeywordListContainer(new KeywordListInfo(
        "User added keywords",
        "userAdded",
        userKeywordsData,
        totalPages
      ));
    } else {
      const filterQuery = this.view.getListViewByType('userAdded').searchKeywordField.value;
      this.updateVisibleKeywords('userAdded', filterQuery);
    }
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

      button = event.target.closest(".keyword-button--view-details");
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
        this.handleKeywordSorting(listType, button);
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
    this.view.container.addEventListener('input', (event) => {
      if (event.target.matches('input[type="text"][data-search]')) {
        const keywordsListContainer = event.target.closest(".keyword-list__container");
        if (!keywordsListContainer) return;
        const listType = keywordsListContainer.dataset.listType;
        this.updateVisibleKeywords(listType, event.target.value);
        return;
      }
    });
    const tooltips = this.view.tooltips;
    tooltips.forEach(tooltip => {
      tooltip.addEventListener("mouseover", this.eventHandlers.toggleTooltip);
    });
    tooltips.forEach(tooltip => {
      tooltip.addEventListener("mouseout", this.eventHandlers.toggleTooltip);
    });
    this.view.analyzeButton.addEventListener("click", this.eventHandlers.analyzeKeyword);
  }
}
