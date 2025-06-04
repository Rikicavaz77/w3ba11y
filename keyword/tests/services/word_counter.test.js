/**
 * @jest-environment jsdom
 */
const WordCounter = require('../../services/word_counter');
const TreeWalkerManager = require('../../services/tree_walker_manager');
const TextProcessor = require('../../services/text_processor');
const TagAccessor = require('../../services/tag_accessor');

global.sw = {
  eng: ['the', 'and', 'is', 'a', 'of'],
  ita: ['il', 'la', 'e']
};

describe('WordCounter', () => {
  let wordCounter;

  beforeEach(() => {
    document.head.innerHTML = `
      <title>Test title</title>
      <meta name="description" content="Test description">
    `;
    document.body.innerHTML = `
      <h1>Test heading</h1>
      <h1>Another test heading</h1>
      <p>This is a test of ("il caffè")</p>
      <img src="test.jpg" alt="Image alt text">
    `;
    const treeWalker = new TreeWalkerManager(document.body);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    wordCounter = new WordCounter(textProcessor, tagAccessor);
  });

  describe('getBaseLang()', () => {
    it('should return base lang correctly', () => {
      let baseLang = wordCounter._getBaseLang('en');
      expect(baseLang).toBe('en');

      baseLang = wordCounter._getBaseLang('en-US');
      expect(baseLang).toBe('en');
    });

    it('should return an empty string if no lang', () => {
      expect(wordCounter._getBaseLang('')).toBe('');
    });
  });

  test('countWords() should count total and unique words', () => {
    const result = wordCounter.countWords();
    expect(result.totalWords).toBe(19);
    expect(result.uniqueWords).toBe(14);
  });

  describe('findOneWordKeywords()', () => {
    it('should filter out english stopwords and return top words', () => {
      const result = wordCounter.findOneWordKeywords();
      expect(result).toContain('test');
      expect(result).not.toContain('is');
      expect(result[0]).toBe('test');
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should filter out english and italian stopwords', () => {
      const result = wordCounter.findOneWordKeywords('it');
      expect(result).toContain('caffè');
      expect(result).toContain('test');
      expect(result).not.toContain('il');
      expect(result).not.toContain('is');
    });
  }); 

  describe('findCompoundKeywords()', () => {
    it('should reject double-word keywords containing any english stopwords', () => {
      const result = wordCounter.findCompoundKeywords();
      expect(result).toContain('test heading');
      expect(result).toContain('il caffè');
      expect(result).not.toContain('this is');
      expect(result).not.toContain('is a');
      expect(result).not.toContain('a test');
      expect(result).not.toContain('test of');
      expect(result[0]).toBe('test heading');
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should reject double-word keywords containing any italian stopwords and more than 50% english stopwords', () => {
      const result = wordCounter.findCompoundKeywords('it');
      expect(result).toContain('test heading');
      expect(result).toContain('this is');
      expect(result).toContain('a test');
      expect(result).toContain('test of');
      expect(result).not.toContain('is a');
      expect(result).not.toContain('il caffè');
      expect(result[0]).toBe('test heading');
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should reject triple-word keywords containing any italian stopwords and more than 50% english stopwords', () => {
      const result = wordCounter.findCompoundKeywords('it', 3);
      expect(result).toContain('another test heading');
      expect(result).toContain('image alt text');
      expect(result).not.toContain('this is a');
      expect(result).not.toContain('is a test');
      expect(result).not.toContain('a test of');
      expect(result[0]).toBe('another test heading');
      expect(result.length).toBeLessThanOrEqual(10);
    });
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
