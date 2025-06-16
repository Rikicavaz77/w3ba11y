class KeywordController {
  constructor(iframe) {
    this.view = new KeywordView(iframe);
    this.eventHandlers = {
      changeTab: this.view.changeTab.bind(this.view),
      showTooltip: this.view.showTooltip.bind(this.view),
      hideTooltip: this.view.hideTooltip.bind(this.view),
      clearHighlightCheckbox: this.view.clearHighlightCheckbox.bind(this.view),
      toggleHighlight: this.toggleHighlight.bind(this),
      updateHighlightColors: this.updateHighlightColors.bind(this),
      analyzeKeyword: this.analyzeKeyword.bind(this)
    };

    const liveDoc = iframe;
    const staticDoc = this.cloneDocument(iframe);

    this.liveTreeWalker = new TreeWalkerManager(liveDoc);
    this.liveTextProcessor = new TextProcessor(liveDoc, this.liveTreeWalker);
    this.keywordHighlighter = new KeywordHighlighter(this.liveTextProcessor);

    this.staticTreeWalker = new TreeWalkerManager(staticDoc);
    this.staticTextProcessor = new TextProcessor(staticDoc, this.staticTreeWalker, true); 
    this.tagAccessor = new TagAccessor(staticDoc, true);
    this.wordCounter = new WordCounter(this.staticTextProcessor, this.tagAccessor);
    this.keywordAnalyzer = new KeywordAnalyzer(
      this.staticTextProcessor, this.tagAccessor, this.wordCounter, new AllInOneAnalysisStrategy()
    );

    this.keywordLists = {
      meta: this.createKeywordList(5, 'Meta keywords'),
      userAdded: this.createKeywordList(5, 'User added keywords'),
      oneWord: this.createKeywordList(5, `Most frequent 'single-word' keywords`, 'desc'),
      twoWords: this.createKeywordList(5, `Most frequent 'double-word' keywords`, 'desc')
    };

    this.activeHighlightedKeyword = null;
    this.init();
  }

  init() {
    this.createOverview();
    this.view.render(this.overviewInfo, this.keywordHighlighter.colorMap);

    this.processMetaKeywords(this.overviewInfo.metaTagKeywordsContent);
    this.processMostFrequentKeywords();
    this.analyzeAndRenderKeywordLists(['meta', 'oneWord', 'twoWords']);

    this.setupTabListeners();
    this.setupTooltipListeners();
    this.bindRefreshAnalysisButton();
    this.bindColorPicker();
    this.bindKeywordInputChange();
    this.bindHighlightToggle();
    this.bindAnalyzeKeyword();
    this.bindKeywordClickEvents();
    this.bindSearchInput();
    this.bindGlobalShortcuts();
  }

  cloneDocument(iframeDoc) {
    const newDoc = document.implementation.createHTMLDocument();
    const htmlClone = iframeDoc.documentElement.cloneNode(true);
    newDoc.replaceChild(htmlClone, newDoc.documentElement);
    return newDoc;
  }

  updateProcessingTools(iframe) {
    const liveDoc = iframe;
    const staticDoc = this.cloneDocument(iframe);

    this.liveTreeWalker.doc = liveDoc;
    this.liveTreeWalker.root = liveDoc.body;
    this.liveTextProcessor.doc = liveDoc;
    this.liveTextProcessor.root = liveDoc.body;

    this.staticTreeWalker.doc = staticDoc;
    this.staticTreeWalker.root = staticDoc.body;
    this.staticTextProcessor.doc = staticDoc;
    this.staticTextProcessor.root = staticDoc.body;
    this.tagAccessor.doc = staticDoc;

    this.liveTreeWalker.createTreeWalker();
    this.staticTreeWalker.createTreeWalker();

    this.keywordAnalyzer.fullRefresh();
  }

  update(iframe, fullRefresh = false) {
    if (!iframe) return;
    this.view.iframe = iframe;
    this.updateProcessingTools(iframe);
    this.wordCounter.countWords();
 
    if (fullRefresh) {
      this.resetHighlightState();
      this.view.clearHighlightCheckbox();
      this.keywordHighlighter.removeHighlight();
    }

    if (!this.overviewInfo || fullRefresh) {
      this.createOverview();
    } else {
      this.overviewInfo.wordCount = this.wordCounter.totalWords;
      this.overviewInfo.uniqueWordCount = this.wordCounter.uniqueWords;
    }
    this.view.renderKeywordAnalysisOverview(this.overviewInfo);

    if (fullRefresh) {
      this.processMetaKeywords(this.overviewInfo.metaTagKeywordsContent);
      this.processMostFrequentKeywords();
    }
    this.analyzeAndRenderKeywordLists(
      ['meta', 'userAdded', 'oneWord', 'twoWords'],
      { renderOnly: !fullRefresh }
    );

    this.setupTooltipListeners();
  }

  // CREATE KEYWORD LIST FUNCTION
  createKeywordList(batchSize, label, defaultSort = null) {
    return {
      batchSize,
      label,
      defaultSort,
      original: [],
      display: []
    };
  }

  // CREATE OVERVIEW FUNCTION
  createOverview() {
    const metaTagKeywordsContent = this.getMetaTagKeywordsContent(this.view.iframe);
    const lang = this.getLang(this.view.iframe);
    this.overviewInfo = new OverviewInfo(
      this.wordCounter.totalWords,
      this.wordCounter.uniqueWords,
      metaTagKeywordsContent,
      lang
    );
  }

  getMetaTagKeywordsContent(doc) {
    return doc.querySelector('meta[name="keywords" i]')?.content ?? '';
  }

  getLang(doc) {
    return doc.documentElement.lang;
  }

  getActiveHighlightedKeyword() {
    return this.activeHighlightedKeyword;
  }

  // PROCESS META KEYWORDS FUNCTION
  processMetaKeywords(rawContent) {
    const keywords = rawContent
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .map(k => new Keyword(k));

    this.keywordLists.meta.original = keywords;
    this.keywordLists.meta.display = [...keywords];
  }

  // PROCESS MOST FREQUENT KEYWORDS FUNCTION
  processMostFrequentKeywords() {
    const oneWordKeywords = this.wordCounter.findOneWordKeywords(this.overviewInfo.lang)
      .map(k => new Keyword(k));

    this.keywordLists.oneWord.original = oneWordKeywords;
    this.keywordLists.oneWord.display = [...oneWordKeywords];

    const twoWordsKeywords = this.wordCounter.findCompoundKeywords(this.overviewInfo.lang)
      .map(k => new Keyword(k));

    this.keywordLists.twoWords.original = twoWordsKeywords;
    this.keywordLists.twoWords.display = [...twoWordsKeywords];
  }

  // ANALYZE AND RENDER KEYWORD LISTS FUNCTION
  analyzeAndRenderKeywordLists(types, { renderOnly = false } = {}) {
    types.forEach(type => {
      const list = this.keywordLists[type];
      if (!list) return;

      const { original } = list;
      this.keywordAnalyzer.analyzeKeywords(original);

      const listView = this.view.getListViewByType(type);
      const isEmpty = original.length === 0;

      if (isEmpty) {
        if (listView) this.view.removeKeywordList(type);
        return;
      }

      if (!listView) {
        this.renderKeywordListByType(type);
      } else {
        if (renderOnly) {
          this.refreshPage(type);
        } else {
          this.updateVisibleKeywords(type);
        }
      }
    });   
  }

  // RENDER KEYWORD LIST FUNCTION
  renderKeywordListByType(type) {
    const list = this.keywordLists[type];
    if (!list) return;

    const { display, batchSize, label, defaultSort } = list;
    const slicedKeywords = display.slice(0, batchSize);
    const totalPages = Math.ceil(display.length / batchSize);

    this.view.renderKeywordListContainer(
      new KeywordListInfo(
        type,
        label,
        slicedKeywords,
        totalPages,
        defaultSort
      ), 
      () => this.getActiveHighlightedKeyword()
    );
  }

  // RENDER PAGE FUNCTION
  renderPage(listView, keywordsToRender, batchSize, currentPage) {
    const totalPages = Math.ceil(keywordsToRender.length / batchSize);
    if (currentPage > totalPages || currentPage < 1) {
      currentPage = 1;
    }

    const start = (currentPage - 1) * batchSize;
    const end = start + batchSize;
    const slicedKeywords = keywordsToRender.slice(start, end);
    listView.render(slicedKeywords, totalPages, currentPage, start);
  }

  // CHANGE PAGE FUNCTION
  changePage(listType, clickedButton) {
    const listView = this.view.getListViewByType(listType);
    if (!listView || listView.isCurrentPageButton(clickedButton)) return;

    const currentPage = parseInt(clickedButton.dataset.page, 10);
    if (isNaN(currentPage)) return;

    const list = this.keywordLists[listType];
    if (!list) return;

    const { display, batchSize } = list;
    this.renderPage(listView, display, batchSize, currentPage);
    listView.scrollToPagination();
  }

  // SORT FUNCTION 
  sortKeywords(keywords, sortDirection) {
    keywords.sort((a, b) => {
      const compare = a.frequency - b.frequency;
      return (sortDirection === 'asc') ? compare : -compare;
    });
  }

  // HANDLE SORTING FUNCTION
  handleKeywordSorting(listType, clickedButton) {
    const listView = this.view.getListViewByType(listType);
    if (!listView || listView.isCurrentSortButton(clickedButton)) return;
    
    const list = this.keywordLists[listType];
    if (!list) return;

    const sortDirection = clickedButton.dataset.sort;
    const { display, batchSize } = list;

    this.sortKeywords(display, sortDirection);
    listView.setCurrentSortButton(clickedButton);
    this.renderPage(listView, display, batchSize, listView.currentPage);
  }

  // SEARCH FUNCTION
  filterKeywords(keywords, filterQuery) {
    const pattern = new RegExp(`${Utils.escapeRegExp(filterQuery)}`, 'i');
    const filteredKeywords = keywords.filter(keywordItem => {
      return pattern.test(keywordItem.name);
    });
    return filteredKeywords;
  }

  // REFRESH PAGE FUNCTION
  refreshPage(listType) {
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;

    const list = this.keywordLists[listType];
    if (!list) return;

    const { display, batchSize } = list;
    this.renderPage(listView, display, batchSize, listView.currentPage);
  }

  // UPDATE VISIBLE KEYWORDS FUNCTION
  updateVisibleKeywords(listType) {
    const listView = this.view.getListViewByType(listType);
    if (!listView) return;

    const list = this.keywordLists[listType];
    if (!list) return;

    const { original, display, batchSize } = list;
    const filterQuery = listView.filterQuery;
    const result = filterQuery ? this.filterKeywords(original, filterQuery) : [...original];

    const sortDirection = listView.sortDirection;
    if (sortDirection) {
      this.sortKeywords(result, sortDirection);
    }

    display.splice(0, display.length, ...result);
    this.renderPage(listView, display, batchSize, listView.currentPage);
  }

  // REMOVE FILTERS FUNCTION
  removeFilters(listType) {
    const listView = this.view.getListViewByType(listType);
    if (!listView || !listView.areFiltersActive()) return;

    const list = this.keywordLists[listType];
    if (!list) return;

    const { original, display, batchSize } = list;

    display.splice(0, display.length, ...original);
    listView.removeFilters();
    this.renderPage(listView, display, batchSize, listView.currentPage);
  }

  // RESET HIGHLIGHT STATE FUNCTION
  resetHighlightState() {
    this.activeHighlightedKeyword = null;
    this.view.clearActiveHighlightButtons();
  }

  // TOGGLE HIGHLIGHT FUNCTION
  toggleHighlight(event) {
    const keyword = this.view.getCustomKeywordValue();
    if (!keyword) return;

    if (event.target.checked) {
      this.resetHighlightState();
      this.keywordHighlighter.highlightKeyword(keyword);
    } else {
      this.resetHighlightState();
      this.keywordHighlighter.removeHighlight();
    }
  }

  // HANDLE HIGHLIGHT CLICK FUNCTION
  handleHighlightClick(keywordItem, clickedButton) {
    if (this.view.isHighlightButtonActive(clickedButton)) {
      this.resetHighlightState();
      this.keywordHighlighter.removeHighlight();
    } else {
      this.activeHighlightedKeyword = keywordItem;
      this.view.clearHighlightCheckbox();
      this.view.setActiveHighlightButton(clickedButton);
      this.keywordHighlighter.highlightKeyword(keywordItem.name);

      if (clickedButton.dataset.keywordSource === 'result') {
        this.refreshPage(clickedButton.dataset.listType);
      }
    }
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
    const { original, display } = this.keywordLists.userAdded;
    const keyword = this.view.getCustomKeywordValue();
    if (
      !keyword ||
      original.some(k => k.name.toLowerCase() === keyword.toLowerCase())
    ) return; 

    const keywordItem = new Keyword(keyword);
    original.push(keywordItem);
    this.keywordAnalyzer.analyzeKeyword(keywordItem);

    this.view.clearCustomKeywordInput();
    if (this.view.isHighlightCheckboxEnabled()) {
      this.activeHighlightedKeyword = keywordItem;
      this.view.clearHighlightCheckbox();
    }
    
    const listView = this.view.getListViewByType('userAdded');
    if (!listView) {
      display.push(keywordItem);
      this.renderKeywordListByType('userAdded');
    } else {
      this.updateVisibleKeywords('userAdded');
    }
  }

  // DELETE KEYWORD FUNCTION
  deleteKeyword(listType, keywordIndex) {
    const list = this.keywordLists[listType];
    if (!list) return;

    const { original, display, batchSize } = list;

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

    this.renderPage(listView, display, batchSize, listView.currentPage);
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

    const list = this.keywordLists[listType];
    if (!list) return;

    const { display } = list;
    return display[keywordIndex];
  }

  // SETUP LISTENERS
  setupTabListeners() {
    this.view.tabButtons.forEach(button => {
      button.addEventListener('click', () => this.eventHandlers.changeTab(button));
    });
  }

  setupTooltipListeners() {
    this.view.tooltipTriggers.forEach(tooltipTrigger => {
      if (tooltipTrigger.dataset.listenerAttached) return;
      tooltipTrigger.dataset.listenerAttached = 'true';
      tooltipTrigger.addEventListener('focus', this.eventHandlers.showTooltip);
      tooltipTrigger.addEventListener('blur', this.eventHandlers.hideTooltip);
      tooltipTrigger.addEventListener('mouseenter', this.eventHandlers.showTooltip);
      tooltipTrigger.addEventListener('mouseleave', this.eventHandlers.hideTooltip);
    });

    this.view.tooltips.forEach(tooltip => {
      if (tooltip.dataset.listenerAttached) return;
      tooltip.dataset.listenerAttached = 'true';
      tooltip.addEventListener('mouseenter', this.eventHandlers.showTooltip);
      tooltip.addEventListener('mouseleave', this.eventHandlers.hideTooltip);
    });
  }

  bindRefreshAnalysisButton() {
    this.view.refreshButton.addEventListener('click', () => {
      this.update(this.view.iframe);
    });
  }

  bindColorPicker() {
    this.view.colorInputs.forEach(input => {
      input.addEventListener('change', this.eventHandlers.updateHighlightColors);
    });
  }

  bindKeywordInputChange() {
    this.view.customKeywordInput.addEventListener('input', this.eventHandlers.clearHighlightCheckbox);
  }

  bindHighlightToggle() {
    this.view.keywordHighlightCheckbox.addEventListener('change', this.eventHandlers.toggleHighlight);
  }

  bindAnalyzeKeyword() {
    this.view.analyzeButton.addEventListener('click', this.eventHandlers.analyzeKeyword);
  }

  bindSearchInput() {
    this.view.allKeywordListContainer.addEventListener('input', event => {
      const target = event.target;

      if (target.matches('input[type="text"][data-search]')) {
        const listType = this.getListType(target);
        if (!listType) return;
        const listView = this.view.getListViewByType(listType);
        if (!listView) return;
        listView.filterQuery = target.value;
        this.updateVisibleKeywords(listType);
      }
    });
  }

  bindGlobalShortcuts() {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' || event.key === 'Esc') {
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
        const listType = this.getListType(target);
        if (!listType) return;
        const keywordItem = this.getKeywordItem(target);
        if (!keywordItem) return;
        this.view.renderKeywordDetails(keywordItem, listType, () => this.getActiveHighlightedKeyword());
        this.view.toggleSection(button.dataset.section);
      });

      handle('.keywords__section__button--back', (button, _) => {
        this.view.toggleSection(button.dataset.section);
      });

      handle('.keywords__pagination__button', (button, target) => {
        const listType = this.getListType(target);
        if (!listType) return;
        this.changePage(listType, button);
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
