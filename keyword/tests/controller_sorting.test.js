const KeywordController = require('../controller/controller');
const Keyword = require('../model/keyword');

describe('KeywordController - sortKeywords()', () => {
  let controller;

  beforeEach(() => {
    controller = { sortKeywords: KeywordController.prototype.sortKeywords};
  });

  it('sort in ascending order', () => {
    const keywords = [
      new Keyword('machine'),
      new Keyword('bear'),
      new Keyword('driver')
    ];

    controller.sortKeywords(keywords, 'asc');

    const result = keywords.map(k => k.name);
    expect(result).toEqual(['bear', 'driver', 'machine']);
  });

  it('sort in descending order', () => {
    const keywords = [
      new Keyword('machine'),
      new Keyword('bear'),
      new Keyword('driver')
    ];

    controller.sortKeywords(keywords, 'desc');

    const result = keywords.map(k => k.name);
    expect(result).toEqual(['machine', 'driver', 'bear']);
  });

  it('sort case-insensitive', () => {
    const keywords = [
      new Keyword('apple'),
      new Keyword('agreement'),
      new Keyword('Apple')
    ];

    controller.sortKeywords(keywords, 'asc');

    const result = keywords.map(k => k.name);
    expect(result).toEqual(['agreement', 'apple', 'Apple']);
  });

  it('sort with numbers', () => {
    const keywords = [
      new Keyword('11'),
      new Keyword('2'),
      new Keyword('item2'),
      new Keyword('item11')
    ];

    controller.sortKeywords(keywords, 'asc');

    const result = keywords.map(k => k.name);
    expect(result).toEqual(['2', '11', 'item2', 'item11']);
  });
});
