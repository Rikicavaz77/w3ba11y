const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');
const KeywordListInfo = require('../../model/keyword_list_info');
global.KeywordListInfo = KeywordListInfo;

describe('KeywordController', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);

    controller.metaKeywords = [new Keyword('meta1')];
    controller.displayMetaKeywords = [new Keyword('meta1_display')];
    controller.batchSizes = { meta: 5 };
    controller.labelMap = { meta: 'Meta keywords' };
    controller.view = { renderKeywordListContainer: jest.fn() };
  });

  describe('getListByType()', () => {
    it('should return the correct list', () => {
      const { original, display } = controller.getListByType('meta');
      expect(original[0].name).toBe('meta1');
      expect(display[0].name).toBe('meta1_display');
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

  afterAll(() => {
    delete global.KeywordListInfo;
  });
});
