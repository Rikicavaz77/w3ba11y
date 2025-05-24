const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');
global.Keyword = Keyword;
const KeywordListInfo = require('../../model/keyword_list_info');
global.KeywordListInfo = KeywordListInfo;
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('KeywordController', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);

    controller.metaKeywords = [new Keyword('meta1')];
    controller.displayMetaKeywords = [new Keyword('meta1_display')];
    controller.userKeywords = [new Keyword('userAdded1')];
    controller.displayUserKeywords = [new Keyword('userAdded1_display')];
    controller.oneWordKeywords = [new Keyword('oneWord1')];
    controller.displayOneWordKeywords = [new Keyword('oneWord1_display')];
    controller.batchSizes = { meta: 5 };
    controller.labelMap = { meta: 'Meta keywords' };
    controller.view = { 
      renderKeywordListContainer: jest.fn()
    };
  });

  describe('getListByType()', () => {
    it('should return the correct list', () => {
      ['meta', 'userAdded', 'oneWord'].forEach(type => {
        const { original, display } = controller.getListByType(type);
        expect(original[0].name).toContain(type);
        expect(display[0].name).toContain(type);
      });
    });

    it('should return null for unknown type', () => {
      const result = controller.getListByType('unknown');
      expect(result).toBeNull();
    });
  });  

  test('renderKeywordListByType() should call renderKeywordListContainer with correct data', () => {
    controller.renderKeywordListByType('meta');
    
    expect(controller.view.renderKeywordListContainer).toHaveBeenCalledTimes(1);
    const arg = controller.view.renderKeywordListContainer.mock.calls[0][0];

    expect(arg).toBeInstanceOf(KeywordListInfo);
    expect(arg.type).toBe('meta');
    expect(arg.title).toBe('Meta keywords');
    expect(arg.keywords.length).toBe(1);
    expect(arg.keywords[0].name).toBe('meta1_display');
    expect(arg.totalPages).toBe(1);
  });

  test('handleKeywordSorting() should sort keywords and update UI', () => {
    const mockListView = {
      updateSortButtons: jest.fn(),
      currentPage: 1
    };
    controller.view.getListViewByType = () => mockListView;

    controller.sortKeywords = jest.fn();
    controller.renderPage = jest.fn();

    const mockButton = {
      dataset: { sort: 'asc' }
    };
    
    controller.handleKeywordSorting('meta', mockButton);

    expect(controller.sortKeywords).toHaveBeenCalledWith(controller.displayMetaKeywords, 'asc');
    expect(mockListView.updateSortButtons).toHaveBeenCalledWith(mockButton);
    expect(controller.renderPage).toHaveBeenCalledWith('meta', mockListView, controller.displayMetaKeywords, 1);
  });

  describe('updateVisibleKeywords()', () => {
    let mockListView;

    beforeEach(() => {
      mockListView = {
        sortDirection: 'desc',
        currentPage: 1
      };
      controller.view.getListViewByType = () => mockListView;

      controller.sortKeywords = jest.fn();
      controller.renderPage = jest.fn();
    });

    it('should filter and render keywords ', () => {
      controller.metaKeywords = [new Keyword('access'), new Keyword('accessibility'), new Keyword('account')];
      controller.displayMetaKeywords = [];
  
      controller.updateVisibleKeywords('meta', 'access');
  
      expect(controller.displayMetaKeywords.map(k => k.name)).toEqual(['access', 'accessibility']);
      const [ sortedKeywords, direction ] = controller.sortKeywords.mock.calls[0];
      expect(sortedKeywords.map(k => k.name)).toEqual(['access', 'accessibility']);
      expect(direction).toBe('desc');
      expect(controller.renderPage).toHaveBeenCalledWith('meta', mockListView, controller.displayMetaKeywords, 1);
    });

    it('should restore original array if filter not set', () => {
      controller.metaKeywords = [new Keyword('access'), new Keyword('accessibility'), new Keyword('account')];
      controller.displayMetaKeywords = [new Keyword('account')];
  
      controller.updateVisibleKeywords('meta', '');
  
      expect(controller.displayMetaKeywords.map(k => k.name)).toEqual(['access', 'accessibility', 'account']);
    });
  });
  
  test('removeFilters() should reset display keywords and update UI', () => {
    const mockListView = {
      removeFilters: jest.fn(),
      currentPage: 1
    };
    controller.view.getListViewByType = () => mockListView;

    controller.renderPage = jest.fn();
    
    controller.removeFilters('meta');

    expect(controller.displayMetaKeywords.map(k => k.name)).toEqual(['meta1']);
    expect(mockListView.removeFilters).toHaveBeenCalled();
    expect(controller.renderPage).toHaveBeenCalledWith('meta', mockListView, controller.displayMetaKeywords, 1);
  });

  describe('analyzeKeyword()', () => {
    beforeEach(() => {
      controller.userKeywords = [];
      controller.displayUserKeywords = [];

      controller.view = {
        customKeywordInput: { value: '  seo  ' },
        getListViewByType: jest.fn()
      };

      controller.keywordAnalyzer = {
        analyzeKeyword: jest.fn()
      };

      controller.renderKeywordListByType = jest.fn();
      controller.updateVisibleKeywords = jest.fn();
    });

    it('should analyze and render first keyword', () => {
      controller.analyzeKeyword();

      expect(controller.userKeywords).toHaveLength(1);
      expect(controller.userKeywords.map(k => k.name)).toEqual(['seo']);
      expect(controller.displayUserKeywords).toHaveLength(1);
      expect(controller.keywordAnalyzer.analyzeKeyword).toHaveBeenCalledWith(expect.any(Keyword));
      expect(controller.renderKeywordListByType).toHaveBeenCalledWith('userAdded');
    });

    it('should analyze and update visible keywords if keyword not first', () => {
      const mockListView = {
        searchKeywordField: { value: 'exist' }
      };

      controller.view.getListViewByType.mockReturnValue(mockListView);

      controller.userKeywords.push(new Keyword('existing'));
      controller.analyzeKeyword();

      expect(controller.updateVisibleKeywords).toHaveBeenCalledWith('userAdded', 'exist');
    });

    it('should do nothing if keyword is empty', () => {
      controller.view.customKeywordInput.value = '    ';
      controller.analyzeKeyword();
      expect(controller.userKeywords).toHaveLength(0);
      expect(controller.keywordAnalyzer.analyzeKeyword).not.toHaveBeenCalled();
    });
  });

  afterAll(() => {
    delete global.Keyword;
    delete global.KeywordListInfo;
    delete global.Utils;
  });
});
