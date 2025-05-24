const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');

describe('KeywordController - sortKeywords()', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);
  });

  describe('sort with different frequencies', () => {
    let keywords;

    beforeEach(() => {
      keywords = [
        new Keyword('machine', { frequency: 10 }),
        new Keyword('bear', { frequency: 20 }),
        new Keyword('driver', { frequency: 15 })
      ];
    });

    it('sort in ascending order', () => {
      controller.sortKeywords(keywords, 'asc');
  
      const result = keywords.map(k => k.name);
      expect(result).toEqual(['machine', 'driver', 'bear']);
    });

    it('sort in descending order', () => {
      controller.sortKeywords(keywords, 'desc');
  
      const result = keywords.map(k => k.name);
      expect(result).toEqual(['bear', 'driver', 'machine']);
    });
  });

  describe('sort with equal frequencies', () => {
    let keywords;

    beforeEach(() => {
      keywords = [
        new Keyword('apple', { frequency: 10 }),
        new Keyword('agreement', { frequency: 10 }),
        new Keyword('Apple', { frequency: 10 })
      ];
    });

    it('sort in ascending order', () => {
      controller.sortKeywords(keywords, 'asc');
  
      const result = keywords.map(k => k.name);
      expect(result).toEqual(['apple', 'agreement', 'Apple']);
    });

    it('sort in descending order', () => {
      controller.sortKeywords(keywords, 'desc');
  
      const result = keywords.map(k => k.name);
      expect(result).toEqual(['apple', 'agreement', 'Apple']);
    });
  });
});
