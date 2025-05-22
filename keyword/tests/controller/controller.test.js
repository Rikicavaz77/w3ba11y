const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');

describe('KeywordController', () => {
  let controller;

  beforeEach(() => {
    controller = { 
      metaKeywords: [new Keyword('meta1')],
      displayMetaKeywords: [new Keyword('meta1_display')],
      userKeywords: [new Keyword('user1')],
      displayUserKeywords: [new Keyword('user1_display')],
      getListByType: KeywordController.prototype.getListByType 
    };
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
});
