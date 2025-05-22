const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');
const Utils = require('../../utils/utils');

global.Utils = {
  escapeRegExp: Utils.escapeRegExp
};

describe('KeywordController - filterKeywords()', () => {
  let controller;

  beforeEach(() => {
    controller = { filterKeywords: KeywordController.prototype.filterKeywords };
  });

  test('should filter keywords based on substring', () => {
    const keywords = [
      new Keyword('dry'),
      new Keyword('bear'),
      new Keyword('driver')
    ];

    const result = controller.filterKeywords(keywords, 'dr');

    expect(result.map(k => k.name)).toEqual(['dry', 'driver']);
  });

  test('should return all keywords if query is empty', () => {
    const keywords = [
      new Keyword('a'),
      new Keyword('b')
    ];

    const result = controller.filterKeywords(keywords, '');

    expect(result).toEqual(keywords);
  });

  test('filter case-insensitive', () => {
    const keywords = [
      new Keyword('apple'),
      new Keyword('agreement'),
      new Keyword('Apple')
    ];

    const result = controller.filterKeywords(keywords, 'app');

    expect(result.map(k => k.name)).toEqual(['apple', 'Apple']);
  });

  afterAll(() => {
    delete global.Utils;
  });
});
