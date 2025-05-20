const WordCounter = require('../services/word_counter');
const TextProcessor = require('../services/text_processor');

global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('WordCounter', () => {
  let wordCounter, mockTextProcessor, mockTagAccessor, mockTreeWalker;

  beforeAll(() => {
    mockTreeWalker = {
      resetWalker: jest.fn(),
      nextNode: jest
        .fn()
        .mockImplementationOnce(() => ({ nodeValue: 'This is a test' }))
        .mockImplementationOnce(() => ({ nodeValue: 'Another test entry' }))
        .mockImplementationOnce(() => null)
    };
    
    mockTextProcessor = {
      getWordsPattern: TextProcessor.prototype.getWordsPattern,
      treeWalker: mockTreeWalker
    };

    mockTagAccessor = {
      getTag: jest.fn(tag => {
        if (tag === 'title') return [{ innerText: 'Title text' }];
        if (tag === 'description') return null;
        if (tag === 'alt') return [{ alt: 'Alt text' }];
      }),
      extractText: jest.fn((tagName, tag) => {
        return tag.innerText || tag.alt || '';
      })
    };

    wordCounter = new WordCounter(mockTextProcessor, mockTagAccessor);
  });

  test('count total and unique words', () => {
    const result = wordCounter.countWords();
    expect(result.totalWords).toBe(11);
    expect(result.uniqueWords).toBe(9);
  });
});
