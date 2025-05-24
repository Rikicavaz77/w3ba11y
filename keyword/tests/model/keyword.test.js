const Keyword = require('../../model/keyword');

describe('Keyword', () => {
  let keyword;

  beforeEach(() => {
   keyword = new Keyword('test', {
    status: 'done',
    frequency: 24,
    keywordOccurrences: {
      title:       1,
      description: 1,
      p:           2 
    }
   });
  });

  test('should set keywordOccurrences correctly', () => {
    keyword.keywordOccurrences = {
      title:       1,
      description: 0,
      p:           2 
    };
    expect(keyword.keywordOccurrences.description).toBe(0);
  });

  test('calculateDensity() should set correct density value', () => {
    keyword.calculateDensity(2000);
    expect(keyword.density).toBeCloseTo(1.2);

    keyword.frequency = 0;
    keyword.calculateDensity(0);
    expect(keyword.density).toBeCloseTo(0);
  });

  test('calculateRelevanceScore() should compute correct score', () => {
    const tagData = {
      title: { weight: 10, tagOccurrences: 1 },
      description: { weight: 8, tagOccurrences: 1 },
      p: { weight: 2, tagOccurrences: 20 },
    };
    keyword.calculateRelevanceScore(tagData);
    expect(keyword.relevanceScore).toBeCloseTo(91);

    keyword.calculateRelevanceScore({});
    expect(keyword.relevanceScore).toBeCloseTo(0);
  });
});
