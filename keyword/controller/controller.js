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
      oneWord: 5,
      twoWords: 5
    };
    this.labelMap = {
      meta: "Meta keywords",
      userAdded: "User added keywords",
      oneWord: "Most frequent 'single-word' keywords",
      twoWords: "Most frequent 'double-word' keywords"
    };
    this.metaKeywords = [];
    this.displayMetaKeywords = [];
    this.userKeywords = [];
    this.displayUserKeywords = [];
    // Most-relevant keywords
    this.oneWordKeywords = [];
    this.displayOneWordKeywords = [];
    this.twoWordsKeywords = [];
    this.displayTwoWordsKeywords = [];

    this.activeHighlightedKeyword = null;
    this.activeHighlightSource = null;
    this.init();
  }

  init() {
    this.createOverview();
    this.view.render(this.overviewInfo, this.keywordHighlighter.colorMap);
    if (this.displayMetaKeywords.length > 0) {
      this.renderKeywordListByType('meta');
    }
    this.processMostFrequentKeywords();
    if (this.displayOneWordKeywords.length > 0) {
      this.renderKeywordListByType('oneWord', 'desc');
    }
    if (this.displayTwoWordsKeywords.length > 0) {
      this.renderKeywordListByType('twoWords', 'desc');
    }
    this.setupTabListeners();
    this.setupTooltipListeners();
    this.bindColorPicker();
    this.bindKeywordInputChange();
    this.bindHighlightToggle();
    this.bindAnalyzeKeyword();
    this.bindKeywordClickEvents();
    this.bindSearchInput();
    this.bindGlobalShortcuts();
  }

  // CREATE OVERVIEW FUNCTION
  createOverview() {
    const metaTagKeywordsContent = this.getMetaTagKeywordsContent(this.view.iframe);
    this.processMetaKeywords(metaTagKeywordsContent);
    const lang = this.getLang(this.view.iframe);
    this.overviewInfo = new OverviewInfo(
      this.wordCounter.totalWords,
      this.wordCounter.uniqueWords,
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

  getActiveHighlightData() {
    return {
      keyword: this.activeHighlightedKeyword,
      source: this.activeHighlightSource
    };
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
      case 'twoWords':
        return {
          original: this.twoWordsKeywords,
          display: this.displayTwoWordsKeywords
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
    const oneWordKeywords = this.wordCounter.findOneWordKeywords(this.overviewInfo.lang)
      .map(k => new Keyword(k));

    this.oneWordKeywords = oneWordKeywords;
    this.displayOneWordKeywords = [...oneWordKeywords];
    this.keywordAnalyzer.analyzeKeywords(oneWordKeywords);

    const twoWordsKeywords = this.wordCounter.findCompoundKeywords(this.overviewInfo.lang)
      .map(k => new Keyword(k));

    this.twoWordsKeywords = twoWordsKeywords;
    this.displayTwoWordsKeywords = [...twoWordsKeywords];
    this.keywordAnalyzer.analyzeKeywords(twoWordsKeywords);
  }

  // RENDER KEYWORD LIST FUNCTION
  renderKeywordListByType(listType, sortDirection = null) {
    const { display } = this.getListByType(listType);
    const batchSize = this.batchSizes[listType] ?? 5;
    const keywordsData = display.slice(0, batchSize);
    const totalPages = Math.ceil(display.length / batchSize);
    this.view.renderKeywordListContainer(new KeywordListInfo(
      this.labelMap[listType] ?? "Keywords",
      listType,
      keywordsData,
      totalPages,
      sortDirection
    ), () => this.getActiveHighlightData());
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
      const compare = a.frequency - b.frequency;
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

  resetHighlightState() {
    this.activeHighlightedKeyword = null;
    this.activeHighlightSource = null;
    this.view.clearActiveButton();
  }

  // TOGGLE HIGHLIGHT FUNCTION
  toggleHighlight(event) {
    let keyword = this.view.customKeywordInput?.value.trim();
    if (!keyword) return;

    if (event.target.checked) {
      this.resetHighlightState();
      this.keywordHighlighter.highlightKeyword(keyword);
    } else {
      this.resetHighlightState();
      this.keywordHighlighter.removeHighlight();
    }
  }

  // HANDLE HIGHLIGHT FUNCTION
  handleHighlightClick(keywordItem, clickedButton) {
    if (this.view.isButtonActive(clickedButton)) {
      this.resetHighlightState();
      this.keywordHighlighter.removeHighlight();
    } else {
      this.activeHighlightedKeyword = keywordItem;
      this.activeHighlightSource = clickedButton.dataset.keywordSource ?? 'list';
      this.clearHighlightCheckbox();
      this.view.setActiveButton(clickedButton);
      this.keywordHighlighter.highlightKeyword(keywordItem.name);
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
    let keyword = this.view.customKeywordInput?.value.trim();
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

  // DELETE KEYWORD FUNCTION
  deleteKeyword(listType, keywordIndex) {
    const { original, display } = this.getListByType(listType);

    const keywordToRemove = display[keywordIndex];
    if (!keywordToRemove) return;

    if (this.activeHighlightedKeyword === keywordToRemove) {
      this.resetHighlightState();
    }

    const indexInOriginal = original.findIndex(k => k === keywordToRemove);
    if (indexInOriginal !== -1) {
      original.splice(indexInOriginal, 1);
    };

    display.splice(keywordIndex, 1);

    const listView = this.view.getListViewByType(listType);
    if (!listView) return;

    this.renderPage(listType, listView, display, listView.currentPage);
  }

  // GET KEYWORD INDEX FUNCTION
  getKeywordIndex(target) {
    const listItem = target.closest('[data-keyword-index]');
    if (!listItem) return;
    const keywordIndex = parseInt(listItem.dataset.keywordIndex, 10);
    if (isNaN(keywordIndex)) return;
    return keywordIndex;
  }

  // GET LIST TYPE FUNCTION
  getListType(target) {
    const keywordListContainer = target.closest('[data-list-type]');
    if (!keywordListContainer) return;
    return keywordListContainer.dataset.listType;
  }

  // GET KEYWORD ITEM FUNCTION
  getKeywordItem(target) {
    const listType = this.getListType(target);
    if (!listType) return;
    const keywordIndex = this.getKeywordIndex(target);
    if (keywordIndex === undefined) return;

    const { display } = this.getListByType(listType);
    return display[keywordIndex];
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

  bindKeywordInputChange() {
    this.view.customKeywordInput.addEventListener("input", this.eventHandlers.clearHighlightCheckbox);
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

      handle('.keyword-button--highlight', (button, target) => {
        let keywordItem;
        if (button.dataset.keywordSource === 'result') {
          keywordItem = this.view.analysis.currentKeywordItem;
        } else {
          keywordItem = this.getKeywordItem(target);
        }
        if (!keywordItem) return;
        this.handleHighlightClick(keywordItem, button);
      });

      handle('.keyword-button--delete', (_, target) => {
        const listType = this.getListType(target);
        if (!listType) return;
        const keywordIndex = this.getKeywordIndex(target);
        if (keywordIndex === undefined) return;
        this.deleteKeyword(listType, keywordIndex);
      });

      handle('.keyword-button--view-details', (button, target) => {
        const keywordItem = this.getKeywordItem(target);
        if (!keywordItem) return;
        this.view.renderKeywordDetails(keywordItem, () => this.getActiveHighlightData());
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
        if (isNaN(currentPage)) return;
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

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordController;
}
