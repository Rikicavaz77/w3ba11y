class KeywordController {
  constructor(iframe) {
    this.view = new KeywordView(iframe);
    this.eventHandlers = {
      changeTab: this.view.changeTab.bind(this.view),
      showTooltip: this.view.showTooltip.bind(this.view),
      hideTooltip: this.view.hideTooltip.bind(this.view),
      clearHighlightCheckbox: this.clearHighlightCheckbox.bind(this),
      toggleHighlight: this.toggleHighlight.bind(this),
      analyzeKeyword: this.analyzeKeyword.bind(this)
    };

    const treeWalker = new TreeWalkerManager(iframe.body);
    const textProcessor = new TextProcessor(iframe, treeWalker);
    const tagAccessor = new TagAccessor(iframe);
    this.wordCounter = new WordCounter(textProcessor, tagAccessor);
    this.keywordAnalyzer = new KeywordAnalyzer(textProcessor, tagAccessor, this.wordCounter, new AllInOneAnalysisStrategy());
    this.keywordHighlighter = new KeywordHighlighter(textProcessor);

    // Keyword Lists Info
    this.batchSizes = {
      meta: 5,
      userAdded: 5,
      oneWord: 5
    };
    this.labelMap = {
      meta: "Meta keywords",
      userAdded: "User added keywords",
      oneWord: "Most frequent 'single-word' keywords"
    };
    this.metaKeywords = [];
    this.displayMetaKeywords = [];
    this.userKeywords = [];
    this.displayUserKeywords = [];
    this.oneWordKeywords = [];
    this.displayOneWordKeywords = [];
    this.init();
  }

  init() {
    this.createOverview();
    this.view.render(this.overviewInfo, this.keywordHighlighter.colorMap);
    if (this.displayMetaKeywords.length > 0) {
      this.renderKeywordListByType("meta");
    }
    this.processMostFrequentKeywords();
    if (this.displayOneWordKeywords.length > 0) {
      this.renderKeywordListByType("oneWord");
    }
    this.setupTabListeners();
    this.setupTooltipListeners();
    this.bindColorPicker();
    this.bindKeywordInputFocus();
    this.bindHighlightToggle();
    this.bindAnalyzeKeyword();
    this.bindKeywordClickEvents();
    this.bindSearchInput();
    this.bindGlobalShortcuts();
  }

  // CREATE OVERVIEW FUNCTION
  createOverview() {
    const wordCountResult = this.wordCounter.countWords();
    const metaTagKeywordsContent = this.getMetaTagKeywordsContent(this.view.iframe);
    this.processMetaKeywords(metaTagKeywordsContent);
    const lang = this.getLang(this.view.iframe);
    this.overviewInfo = new OverviewInfo(
      wordCountResult.totalWords,
      wordCountResult.uniqueWords,
      metaTagKeywordsContent,
      lang
    );
  }

  getMetaTagKeywordsContent(doc) {
    return doc.querySelector("meta[name='keywords' i]")?.content ?? '';
  }

  getLang(doc) {
    return doc.documentElement.lang;
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
      case 'oneWord':
        return {
          original: this.oneWordKeywords,
          display: this.displayOneWordKeywords
        };    
      default:
        return null;
    }
  }

  // PROCESS META KEYWORDS FUNCTION
  processMetaKeywords(rawContent) {
    if (!rawContent) return;
    const keywords = rawContent
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .map(k => new Keyword(k));

    this.metaKeywords = keywords;
    this.displayMetaKeywords = [...keywords];
    this.keywordAnalyzer.analyzeKeywords(keywords);
  }

  processMostFrequentKeywords() {
    const keywords = this.wordCounter.findOneWordKeywords(this.overviewInfo.lang)
      .map(k => new Keyword(k));

    this.oneWordKeywords = keywords;
    this.displayOneWordKeywords = [...keywords];
    this.keywordAnalyzer.analyzeKeywords(keywords);
  }

  // RENDER KEYWORD LIST FUNCTION
  renderKeywordListByType(listType) {
    const { display } = this.getListByType(listType);
    const batchSize = this.batchSizes[listType] ?? 5;
    const keywordsData = display.slice(0, batchSize);
    const totalPages = Math.ceil(display.length / batchSize);
    this.view.renderKeywordListContainer(new KeywordListInfo(
      this.labelMap[listType] ?? "Keywords",
      listType,
      keywordsData,
      totalPages
    ));
  }

  // RENDER PAGE FUNCTION
  renderPage(listType, listView, keywordList, currentPage) {
    const batchSize = this.batchSizes[listType] ?? 5;
    const totalPages = Math.ceil(keywordList.length / batchSize);
    if (currentPage > totalPages || currentPage < 1) {
      currentPage = 1;
    }
    let start = (currentPage - 1) * batchSize;
    let end = start + batchSize;
    const keywordsData = keywordList.slice(start, end);
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
    const filteredKeywords = keywords.filter(keywordItem => {
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

  // TOGGLE HIGHLIGHT FUNCTION
  toggleHighlight(event) {
    let keyword = this.view.customKeywordInput?.value;
    if (!keyword) return;

    keyword = Utils.sanitizeInput(keyword);
    if (!keyword) return; 

    if (event.target.checked) {
      this.keywordHighlighter.highlightKeyword(keyword);
    } else {
      this.keywordHighlighter.removeHighlight();
    }
  }

  clearHighlightCheckbox() {
    this.view.keywordHighlightCheckbox.checked = false;
  }

  // UPDATE HIGHLIGHT COLORS FUNCTION
  updateHighlightColors(event) {
    const input = event.target;
    const tag = input.dataset.tag;
    const prop = input.dataset.prop;
    const value = input.value;
    this.keywordHighlighter.updateTagColors(tag, prop, value);
  }

  // ANALYZE KEYWORD FUNCTION
  analyzeKeyword() {
    let keyword = this.view.customKeywordInput?.value;
    if (!keyword) return; 

    keyword = Utils.sanitizeInput(keyword);
    if (!keyword) return; 

    const keywordItem = new Keyword(keyword);
    this.userKeywords.push(keywordItem);
    this.keywordAnalyzer.analyzeKeyword(keywordItem);

    if (this.userKeywords.length === 1) {
      this.displayUserKeywords.push(keywordItem);
      this.renderKeywordListByType("userAdded");
    } else {
      const filterQuery = this.view.getListViewByType('userAdded').searchKeywordField?.value?.trim();
      this.updateVisibleKeywords('userAdded', filterQuery);
    }
  }

  // GET KEYWORD ITEM FUNCTION
  getKeywordItem(target) {
    const listItem = target.closest('.keyword-list-item');
    const keywordListContainer = target.closest('.keyword-list__container');
    if (!listItem || !keywordListContainer) return;
    const { display } = this.getListByType(keywordListContainer.dataset.listType);
    const keywordIndex = parseInt(listItem.dataset.keywordIndex, 10);
    if (isNaN(keywordIndex)) return;
    return display[keywordIndex];
  }

  // GET LIST TYPE FUNCTION
  getListType(target) {
    const keywordsListContainer = target.closest(".keyword-list__container");
    if (!keywordsListContainer) return;
    return keywordsListContainer.dataset.listType;
  }

  // SETUP LISTENERS
  setupTabListeners() {
    this.view.tabButtons.forEach(button => {
      button.addEventListener('click', () => this.eventHandlers.changeTab(button));
    });
  }

  setupTooltipListeners(view = this.view) {
    view.tooltipsTrigger.forEach(tooltipTrigger => {
      tooltipTrigger.addEventListener("focus", this.eventHandlers.showTooltip);
      tooltipTrigger.addEventListener("blur", this.eventHandlers.hideTooltip);
      tooltipTrigger.addEventListener("mouseenter", this.eventHandlers.showTooltip);
      tooltipTrigger.addEventListener("mouseleave", this.eventHandlers.hideTooltip);
    });

    view.tooltips.forEach(tooltip => {
      tooltip.addEventListener("mouseenter", this.eventHandlers.showTooltip);
      tooltip.addEventListener("mouseleave", this.eventHandlers.hideTooltip);
    });
  }

  bindColorPicker() {
    this.view.container.addEventListener('change', event => {
      if (event.target.matches('input[type="color"][data-highlight]')) {
        this.updateHighlightColors(event);
      }
    });
  }

  bindKeywordInputFocus() {
    this.view.customKeywordInput.addEventListener("focus", this.eventHandlers.clearHighlightCheckbox);
  }

  bindHighlightToggle() {
    this.view.keywordHighlightCheckbox.addEventListener("change", this.eventHandlers.toggleHighlight);
  }

  bindAnalyzeKeyword() {
    this.view.analyzeButton.addEventListener("click", this.eventHandlers.analyzeKeyword);
  }

  bindSearchInput() {
    this.view.container.addEventListener('input', event => {
      const target = event.target;

      if (target.matches('input[type="text"][data-search]')) {
        const listType = this.getListType(target);
        if (!listType) return;
        this.updateVisibleKeywords(listType, target.value.trim());
      }
    });
  }

  bindGlobalShortcuts() {
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" || event.key === "Esc") {
        this.view.hideAllTooltips();
      }
    });
  }

  bindKeywordClickEvents() {
    this.view.container.addEventListener('click', event => {
      const target = event.target;

      const handle = (selector, fn) => {
        const button = target.closest(selector);
        if (button) fn(button, target);
      };

      handle('.keyword-button--highlight', (_, target) => {
        const keywordItem = this.getKeywordItem(target);
        if (!keywordItem) return;
        this.clearHighlightCheckbox();
        this.keywordHighlighter.highlightKeyword(keywordItem.name);
      });

      handle('.keyword-button--view-details', (button, target) => {
        const keywordItem = this.getKeywordItem(target);
        if (!keywordItem) return;
        this.view.renderKeywordDetails(keywordItem);
        this.view.toggleSection(button.dataset.section);
        this.setupTooltipListeners(this.view.analysis);
      });

      handle('.keywords__section__button--back', (button, _) => {
        this.view.toggleSection(button.dataset.section);
      });

      handle('.keywords__pagination__button', (button, target) => {
        const listType = this.getListType(target);
        if (!listType) return;
        const currentPage = parseInt(button.dataset.page, 10);
        this.changePage(listType, currentPage);
      });

      handle('.keywords__sort-button', (button, target) => {
        const listType = this.getListType(target);
        if (!listType) return;
        this.handleKeywordSorting(listType, button);
      });

      handle('.keywords__remove-filters', (_, target) => {
        const listType = this.getListType(target);
        if (!listType) return;
        this.removeFilters(listType);
      });
    });
  }
}
