/**
 * @jest-environment jsdom
 */
const WordCounter = require('../services/word_counter');
const TextProcessor = require('../services/text_processor');
const TreeWalkerManager = require('../services/tree_walker_manager');
const TagAccessor = require('../services/tag_accessor');

global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('WordCounter', () => {
  let wordCounter;

  beforeEach(() => {
    document.head.innerHTML = '';
    const title = document.createElement('title');
    title.innerText = 'Test title';
    document.head.appendChild(title);
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Test description';
    document.head.appendChild(meta);
    document.body.innerHTML = `
      <h1>Test heading</h1>
      <h1>Another test heading</h1>
      <p>This is a test ("il caffè")</p>
      <img src="test.jpg" alt="Image alt text">
    `;
    const treeWalker = new TreeWalkerManager(document.body);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    wordCounter = new WordCounter(textProcessor, tagAccessor);
  });

  test('countWords() should count total and unique words', () => {
    const result = wordCounter.countWords();
    expect(result.totalWords).toBe(18);
    expect(result.uniqueWords).toBe(13);
  });

  test('findOneWordKeywords() should filter out english stopwords and return top words', () => {
    const result = wordCounter.findOneWordKeywords();
    expect(result).toContain('test');
    expect(result).not.toContain('is');
    expect(result[0]).toBe('test');
    expect(result.length).toBeLessThanOrEqual(10);
  });

  test('findOneWordKeywords() should filter out english and italian stopwords', () => {
    const result = wordCounter.findOneWordKeywords('it');
    expect(result).toContain('caffè');
    expect(result).toContain('test');
    expect(result).not.toContain('il');
    expect(result).not.toContain('is');
  });

  test('resetCache() should force recount', () => {
    const firstCount = wordCounter.countWords();

    const newTextNode = document.createTextNode('extra words here');
    document.body.appendChild(newTextNode);

    wordCounter.resetCache();
    const secondCount = wordCounter.countWords();
    expect(secondCount.totalWords).toBeGreaterThan(firstCount.totalWords);
    expect(secondCount.uniqueWords).toBeGreaterThanOrEqual(firstCount.uniqueWords);
  });

  afterAll(() => {
    delete global.sw;
  });
});
