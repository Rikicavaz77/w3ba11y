const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');
global.Keyword = Keyword;
const KeywordListInfo = require('../../model/keyword_list_info');
global.KeywordListInfo = KeywordListInfo;
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('KeywordController', () => {
  let controller, mockListView;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);

    const keywords = [
      new Keyword('meta1'), 
      new Keyword('userAdded1'), 
      new Keyword('oneWord1'), 
      new Keyword('twoWords1')
    ];

    controller.keywordLists = {
      meta: {
        label: 'Meta keywords',
        batchSize: 5,
        original: [keywords[0]],
        display: [keywords[0]]
      },
      userAdded: {
        batchSize: 5,
        original: [keywords[1]],
        display: [keywords[1]]
      },
      oneWord: {
        defaultSort: 'desc',
        original: [keywords[2]],
        display: [keywords[2]]
      },
      twoWords: {
        original: [keywords[3]],
        display: [keywords[3]]
      },
    }

    controller.activeHighlightedKeyword = keywords[0];
    controller.activeHighlightSource = 'list';

    mockListView = {
      setCurrentSortButton: jest.fn(),
      removeFilters: jest.fn(),
      getSearchQuery: jest.fn().mockReturnValue('exist'),
      sortDirection: 'desc',
      currentPage: 1,
      isCurrentPageButton: jest.fn().mockReturnValue(false),
      isCurrentSortButton: jest.fn().mockReturnValue(false),
      areFiltersActive: jest.fn().mockReturnValue(true)
    };
    controller.view = { 
      renderKeywordListContainer: jest.fn(),
      clearActiveHighlightButton: jest.fn(),
      getListViewByType: jest.fn().mockReturnValue(mockListView),
      getCustomKeywordValue: jest.fn().mockReturnValue('seo'),
      isHighlightCheckboxEnabled: jest.fn().mockReturnValue(false),
      clearHighlightCheckbox: jest.fn(),
      clearCustomKeywordInput: jest.fn(),
      removeKeywordList: jest.fn()
    };
  });

  test('getActiveHighlightData() should return highlight data correctly', () => {
    const highlightData = controller.getActiveHighlightData();
    expect(highlightData.keyword).toBe(controller.keywordLists.meta.original[0]);
    expect(highlightData.source).toBe('list');
  });

  describe('analyzeAndRenderKeywordLists()', () => {
    beforeEach(() => {
      controller.keywordAnalyzer = {
        analyzeKeywords: jest.fn()
      };

      controller.renderKeywordListByType = jest.fn();
      controller.updateVisibleKeywords = jest.fn();
    }); 

    it('should analyze and render keyword lists for the first time', () => {
      controller.view.getListViewByType = jest.fn().mockReturnValue(null);

      controller.analyzeAndRenderKeywordLists(['meta', 'oneWord']);
      
      expect(controller.keywordAnalyzer.analyzeKeywords).toHaveBeenCalledTimes(2);
      let calls = controller.keywordAnalyzer.analyzeKeywords.mock.calls;
      expect(calls[0][0]).toBe(controller.keywordLists.meta.original);
      expect(calls[1][0]).toBe(controller.keywordLists.oneWord.original);

      expect(controller.renderKeywordListByType).toHaveBeenCalledTimes(2);
      calls = controller.renderKeywordListByType.mock.calls;
      expect(calls[0][0]).toBe('meta');
      expect(calls[1][0]).toBe('oneWord');
    });

    it('should analyze and update visible keywords', () => {
      controller.analyzeAndRenderKeywordLists(['meta', 'oneWord']);
      
      expect(controller.keywordAnalyzer.analyzeKeywords).toHaveBeenCalledTimes(2);
      let calls = controller.keywordAnalyzer.analyzeKeywords.mock.calls;
      expect(calls[0][0]).toBe(controller.keywordLists.meta.original);
      expect(calls[1][0]).toBe(controller.keywordLists.oneWord.original);

      expect(controller.updateVisibleKeywords).toHaveBeenCalledTimes(2);
      calls = controller.updateVisibleKeywords.mock.calls;
      expect(calls[0][0]).toBe('meta');
      expect(calls[0][1]).toBe('exist');
      expect(calls[1][0]).toBe('oneWord');
      expect(calls[1][1]).toBe('exist');
    });

    it('should remove existing list', () => {
      controller.keywordLists.meta.original = [];
      controller.keywordLists.meta.display = [];

      controller.analyzeAndRenderKeywordLists(['meta']);
      
      expect(controller.view.removeKeywordList).toHaveBeenCalledWith('meta');
    });
  });

  test('renderKeywordListByType() should call renderKeywordListContainer with correct data', () => {
    controller.renderKeywordListByType('meta');
    
    expect(controller.view.renderKeywordListContainer).toHaveBeenCalled();
    const args = controller.view.renderKeywordListContainer.mock.calls[0];
    let arg = args[0];
    expect(arg).toBeInstanceOf(KeywordListInfo);
    expect(arg.type).toBe('meta');
    expect(arg.title).toBe('Meta keywords');
    expect(arg.keywords.length).toBe(1);
    expect(arg.keywords[0].name).toBe('meta1');
    expect(arg.totalPages).toBe(1);
    expect(arg.sortDirection).toBeNull();
    arg = args[1];
    expect(typeof arg).toBe('function');
    expect(arg()).toEqual({
      keyword: controller.keywordLists.meta.original[0],
      source: 'list'
    });

    controller.renderKeywordListByType('oneWord');
    arg = controller.view.renderKeywordListContainer.mock.calls[1][0];
    expect(arg).toBeInstanceOf(KeywordListInfo);
    expect(arg.sortDirection).toBe('desc');
  });

  describe('handleKeywordSorting()', () => {
    let mockButton;

    beforeEach(() => {
      controller.sortKeywords = jest.fn();
      controller.renderPage = jest.fn();
      
      mockButton = {
        dataset: { sort: 'asc' }
      };
    });

    it('should sort keywords and update UI', () => {      
      controller.handleKeywordSorting('meta', mockButton);
      expect(controller.sortKeywords).toHaveBeenCalledWith(controller.keywordLists.meta.display, 'asc');
      expect(mockListView.setCurrentSortButton).toHaveBeenCalledWith(mockButton);
      expect(controller.renderPage).toHaveBeenCalledWith(
        mockListView, 
        controller.keywordLists.meta.display, 
        5,
        1
      );
    });

    it('should do nothing if sort button already active', () => {
      mockListView.isCurrentSortButton = jest.fn().mockReturnValue(true);
      
      controller.handleKeywordSorting('meta', mockButton);
      expect(controller.sortKeywords).not.toHaveBeenCalled();
      expect(mockListView.setCurrentSortButton).not.toHaveBeenCalledWith();
      expect(controller.renderPage).not.toHaveBeenCalledWith();
    });
  });

  describe('updateVisibleKeywords()', () => {
    beforeEach(() => {
      controller.sortKeywords = jest.fn();
      controller.renderPage = jest.fn();
    });

    it('should filter and render keywords ', () => {
      controller.keywordLists.meta.original = [
        new Keyword('access'), 
        new Keyword('accessibility'),
        new Keyword('account')
      ];
      controller.keywordLists.meta.display = [];
  
      controller.updateVisibleKeywords('meta', 'access');
      expect(controller.keywordLists.meta.display.map(k => k.name)).toEqual([
        'access', 'accessibility'
      ]);
      const [ sortedKeywords, direction ] = controller.sortKeywords.mock.calls[0];
      expect(sortedKeywords.map(k => k.name)).toEqual(['access', 'accessibility']);
      expect(direction).toBe('desc');
      expect(controller.renderPage).toHaveBeenCalledWith(
        mockListView, 
        controller.keywordLists.meta.display, 
        5,
        1
      );
    });

    it('should restore original array if filter not set', () => {
      controller.keywordLists.meta.original = [
        new Keyword('access'), new Keyword('accessibility'), new Keyword('account')
      ];
      controller.keywordLists.meta.display = [new Keyword('account')];
  
      controller.updateVisibleKeywords('meta', '');
      expect(controller.keywordLists.meta.display.map(k => k.name)).toEqual([
        'access', 'accessibility', 'account'
      ]);
    });
  });
  
  describe('removeFilters()', () => {
    beforeEach(() => {
      controller.renderPage = jest.fn();
    });

    it('should reset display keywords and update UI', () => {
      controller.keywordLists.meta.display.push(new Keyword('meta2'));
      
      controller.removeFilters('meta');
      expect(controller.keywordLists.meta.display.map(k => k.name)).toEqual(['meta1']);
      expect(mockListView.removeFilters).toHaveBeenCalled();
      expect(controller.renderPage).toHaveBeenCalledWith( 
        mockListView, 
        controller.keywordLists.meta.display, 
        5,
        1
      );
    });

    it('should do nothing if filters already inactive', () => {    
      mockListView.areFiltersActive = jest.fn().mockReturnValue(false); 
      controller.removeFilters('meta');
      expect(mockListView.removeFilters).not.toHaveBeenCalled();
      expect(controller.renderPage).not.toHaveBeenCalled();
    });
  });

  test('resetHighlightState() should reset highlight data correctly', () => {
    controller.resetHighlightState();
    expect(controller.activeHighlightedKeyword).toBeNull();
    expect(controller.activeHighlightSource).toBeNull();
    expect(controller.view.clearActiveHighlightButton).toHaveBeenCalled();
  });

  describe('analyzeKeyword()', () => {
    beforeEach(() => {
      controller.keywordLists.userAdded.original = [];
      controller.keywordLists.userAdded.display = [];

      controller.keywordAnalyzer = {
        analyzeKeyword: jest.fn()
      };

      controller.renderKeywordListByType = jest.fn();
      controller.updateVisibleKeywords = jest.fn();
    });

    it('should analyze and render first keyword', () => {
      controller.view.getListViewByType = jest.fn().mockReturnValue(null);
      controller.analyzeKeyword();
      expect(controller.keywordLists.userAdded.original).toHaveLength(1);
      expect(controller.keywordLists.userAdded.original.map(k => k.name)).toEqual(['seo']);
      expect(controller.keywordLists.userAdded.display).toHaveLength(1);
      expect(controller.keywordAnalyzer.analyzeKeyword).toHaveBeenCalledWith(expect.any(Keyword));
      expect(controller.view.clearCustomKeywordInput).toHaveBeenCalled();
      expect(controller.renderKeywordListByType).toHaveBeenCalledWith('userAdded');
    });

    it('should analyze and update visible keywords if keyword not first', () => {
      controller.keywordLists.userAdded.original.push(new Keyword('existing'));
      controller.analyzeKeyword();
      expect(controller.view.clearCustomKeywordInput).toHaveBeenCalled();
      expect(controller.updateVisibleKeywords).toHaveBeenCalledWith('userAdded', 'exist');
    });

    it('should analyze and render keyword with highlight button active', () => {
      controller.view.isHighlightCheckboxEnabled.mockReturnValue(true);
      controller.analyzeKeyword();
      expect(controller.keywordAnalyzer.analyzeKeyword).toHaveBeenCalledWith(expect.any(Keyword));
      expect(controller.view.clearCustomKeywordInput).toHaveBeenCalled();
      expect(controller.activeHighlightedKeyword.name).toBe('seo');
      expect(controller.activeHighlightSource).toBe('list');
      expect(controller.view.clearHighlightCheckbox).toHaveBeenCalled();
    });

    it('should do nothing if keyword is empty', () => {
      controller.view.getCustomKeywordValue = jest.fn().mockReturnValue('');
      controller.analyzeKeyword();
      expect(controller.keywordLists.userAdded.original).toHaveLength(0);
      expect(controller.keywordAnalyzer.analyzeKeyword).not.toHaveBeenCalled();
      expect(controller.view.clearCustomKeywordInput).not.toHaveBeenCalled();
    });

    it('should do nothing if keyword already exists', () => {
      const keyword = new Keyword('seo');
      controller.keywordLists.userAdded.original.push(keyword);
      controller.keywordLists.userAdded.display.push(keyword);
      controller.analyzeKeyword();
      expect(controller.keywordLists.userAdded.original).toHaveLength(1);
      expect(controller.keywordAnalyzer.analyzeKeyword).not.toHaveBeenCalled();
      expect(controller.view.clearCustomKeywordInput).not.toHaveBeenCalled();
    });
  });

  describe('deleteKeyword()', () => {
    beforeEach(() => {
      controller.resetHighlightState = jest.fn();
      controller.renderPage = jest.fn();

      controller.keywordLists.userAdded.original.push(
        new Keyword('another userAdded keyword'), 
        new Keyword('last userAdded keyword')
      );
      controller.keywordLists.userAdded.display = [...controller.keywordLists.userAdded.original];
      controller.keywordLists.userAdded.display.pop();
    });

    it('should remove keyword from arrays', () => {
      controller.deleteKeyword('userAdded', 1);

      expect(controller.keywordLists.userAdded.original.map(k => k.name)).toEqual([
        'userAdded1', 'last userAdded keyword'
      ]);
      expect(controller.keywordLists.userAdded.display.map(k => k.name)).toEqual(['userAdded1']);
      expect(controller.resetHighlightState).not.toHaveBeenCalled();
      expect(controller.renderPage).toHaveBeenCalledWith(
        mockListView, 
        controller.keywordLists.userAdded.display, 
        5,
        1
      );
    });

    it('should remove keyword from arrays and reset highlight state', () => {
      controller.activeHighlightedKeyword = controller.keywordLists.userAdded.display[1];

      controller.deleteKeyword('userAdded', 1);

      expect(controller.keywordLists.userAdded.original.map(k => k.name)).toEqual([
        'userAdded1', 'last userAdded keyword'
      ]);
      expect(controller.keywordLists.userAdded.display.map(k => k.name)).toEqual(['userAdded1']);
      expect(controller.resetHighlightState).toHaveBeenCalled();
      expect(controller.renderPage).toHaveBeenCalledWith(
        mockListView, 
        controller.keywordLists.userAdded.display, 
        5,
        1
      );
    });

    it('should not remove keyword if keywordIndex is invalid', () => {
      controller.deleteKeyword('userAdded', 5);

      expect(controller.keywordLists.userAdded.original.map(k => k.name)).toEqual([
        'userAdded1', 'another userAdded keyword', 'last userAdded keyword'
      ]);
      expect(controller.keywordLists.userAdded.display.map(k => k.name)).toEqual([
        'userAdded1', 'another userAdded keyword'
      ]);
      expect(controller.renderPage).not.toHaveBeenCalled();
    });

    it('should not call renderPage if listView is null', () => {
      controller.view.getListViewByType = jest.fn().mockReturnValue(null),

      controller.deleteKeyword('userAdded', 1);

      expect(controller.renderPage).not.toHaveBeenCalled();
    });
  });

  afterAll(() => {
    delete global.Keyword;
    delete global.KeywordListInfo;
    delete global.Utils;
  });
});
