/**
 * @jest-environment jsdom
 */
const KeywordAnalyzer = require('@keyword/services/keyword_analyzer');
const TreeWalkerManager = require('@keyword/services/tree_walker_manager');
const TextProcessor = require('@keyword/services/text_processor');
const TagAccessor = require('@keyword/services/tag_accessor');
const WordCounter = require('@keyword/services/word_counter');
const KeywordAnalysisStrategy = require('@keyword/services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const AllInOneAnalysisStrategy = require('@keyword/services/strategy/all_in_one_analysis_strategy');
const Keyword = require('@keyword/model/keyword');
const Utils = require('@keyword/utils/utils');
global.Utils = Utils;

global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('KeywordAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    document.head.innerHTML = `
      <title>Keyword appears in the title</title>
      <meta name="description" content="Keyword here too">
    `;
    document.body.innerHTML = `
      <p>This is a test keyword.</p>
      <script>document.getElementById("keyword");</script>
      <p>Another keyword appears here.</p>
      <img src="test.jpg" alt="keyword in alt tag">
      <p>Compound keyword appears in the same tag</p>
      <p><strong style="display: inline;">Compound <em style="display: inline;">keyword</em></strong> appears in two different tags</p>
    `;
    const treeWalker = new TreeWalkerManager(document);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    const wordCounter = new WordCounter(textProcessor, tagAccessor);
    analyzer = new KeywordAnalyzer(
      textProcessor, 
      tagAccessor, 
      wordCounter, 
      new AllInOneAnalysisStrategy()
    );
  });

  test('countOccurrencesInTag() should return keyword occurrences in a specified tag', () => {
    const pattern = analyzer._textProcessor.getKeywordPattern('keyword');
    let count = analyzer.countOccurrencesInTag('p', pattern);
    expect(count).toBe(4);
  });

  describe('analyzeKeyword()', () => {
    let keywords;

    beforeEach(() => {
      keywords = [new Keyword('keyword'), new Keyword('compound keyword')];
    });

    it('should update keyword data correctly', () => {  
      analyzer.analyzeKeyword(keywords[0]);
      expect(keywords[0].frequency).toBe(7);
      expect(keywords[0].keywordOccurrences.title).toBe(1);
      expect(keywords[0].keywordOccurrences.description).toBe(1);
      expect(keywords[0].keywordOccurrences.h1).toBe(0);
      expect(keywords[0].keywordOccurrences.p).toBe(4);
      expect(keywords[0].keywordOccurrences.alt).toBe(1);
      expect(keywords[0].density).toBeCloseTo(20);
      expect(keywords[0].status).toBe('done');
  
      analyzer.analyzeKeyword(keywords[1]);
      expect(keywords[1].frequency).toBe(2);
      expect(keywords[1].keywordOccurrences.title).toBe(0);
      expect(keywords[1].keywordOccurrences.description).toBe(0);
      expect(keywords[1].keywordOccurrences.h1).toBe(0);
      expect(keywords[1].keywordOccurrences.p).toBe(2);
      expect(keywords[1].keywordOccurrences.strong).toBe(1);
      expect(keywords[1].keywordOccurrences.em).toBe(0);
      expect(keywords[1].keywordOccurrences.alt).toBe(0);
      expect(keywords[1].density).toBeCloseTo(5.71);
      expect(keywords[1].status).toBe('done');
    });

    it('should reanalyze keyword correctly', () => {  
      analyzer.analyzeKeyword(keywords[0]);
      expect(keywords[0].frequency).toBe(7);

      const span = document.createElement('span');
      span.textContent = 'Keyword here';
      document.body.appendChild(span);
  
      analyzer.analyzeKeyword(keywords[0]);
      expect(keywords[0].frequency).toBe(8);
    });
  });

  describe('analyzeKeywords()', () => {
    let keywords, treeWalkerSpy, querySelectorSpy, querySelectorAllSpy;

    beforeEach(() => {
      keywords = [new Keyword('keyword'), new Keyword('appears'), new Keyword('keyword appears')];

      treeWalkerSpy = jest.spyOn(analyzer._textProcessor._treeWalker, 'resetWalker');
      querySelectorSpy = jest.spyOn(document, 'querySelector');
      querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should process multiple keywords', () => {
      analyzer.analyzeKeywords(keywords);
      expect(keywords[0].frequency).toBe(7);
      expect(keywords[1].frequency).toBe(4);
      expect(keywords[2].frequency).toBe(4);
      expect(keywords[0].keywordOccurrences.title).toBe(1);
      expect(keywords[0].keywordOccurrences.description).toBe(1);
      expect(keywords[0].keywordOccurrences.p).toBe(4);
      expect(keywords[0].keywordOccurrences.em).toBe(1);
      expect(keywords[1].keywordOccurrences.title).toBe(1);
      expect(keywords[1].keywordOccurrences.description).toBe(0);
      expect(keywords[1].keywordOccurrences.p).toBe(3);
      expect(keywords[1].keywordOccurrences.em).toBe(0);
      expect(keywords[2].keywordOccurrences.title).toBe(1);
      expect(keywords[2].keywordOccurrences.description).toBe(0);
      expect(keywords[2].keywordOccurrences.p).toBe(3);
      expect(keywords[2].keywordOccurrences.em).toBe(0);

      expect(treeWalkerSpy).toHaveBeenCalledTimes(2);
      expect(querySelectorSpy).toHaveBeenCalledTimes(2);
      expect(querySelectorAllSpy).toHaveBeenCalledTimes(1);
      expect(analyzer._textProcessor._cachedTextNodes).toBeNull();
      expect(analyzer._textProcessor._cachedNodeGroups).toBeNull();
      expect(analyzer._tagAccessor._cache).toEqual({});
    }); 

    it('should analyze keywords with cache active', () => {
      analyzer._textProcessor.useCache = true;
      analyzer._tagAccessor.useCache = true;

      analyzer.analyzeKeywords(keywords);
      
      expect(treeWalkerSpy).toHaveBeenCalledTimes(2);
      expect(querySelectorSpy).toHaveBeenCalledTimes(2);
      expect(querySelectorAllSpy).toHaveBeenCalledTimes(1);
      expect(analyzer._textProcessor.useCache).toBe(true);
      expect(analyzer._tagAccessor.useCache).toBe(true);
      expect(analyzer._textProcessor._cachedTextNodes).toBeDefined();
      expect(analyzer._textProcessor._cachedNodeGroups).toBeDefined();
      expect(Object.keys(analyzer._tagAccessor._cache).length).toBeGreaterThan(0);
    });
  });

  describe('resetCache()', () => {
    beforeEach(() => {
      analyzer._textProcessor.resetCache = jest.fn();
      analyzer._tagAccessor.resetCache = jest.fn();
      analyzer._wordCounter.resetCache = jest.fn();
      analyzer._strategy.resetCache = jest.fn();
    });

    it('should reset all caches', () => {
      analyzer._resetCache({
        text: true,
        tags: true,
        words: true,
        strategy: true
      });

      expect(analyzer._textProcessor.resetCache).toHaveBeenCalled();
      expect(analyzer._tagAccessor.resetCache).toHaveBeenCalled();
      expect(analyzer._wordCounter.resetCache).toHaveBeenCalled();
      expect(analyzer._strategy.resetCache).toHaveBeenCalled();
    });

    it('should reset some caches', () => {
      analyzer._resetCache({
        text: true,
        words: true
      });

      expect(analyzer._textProcessor.resetCache).toHaveBeenCalled();
      expect(analyzer._tagAccessor.resetCache).not.toHaveBeenCalled();
      expect(analyzer._wordCounter.resetCache).toHaveBeenCalled();
      expect(analyzer._strategy.resetCache).not.toHaveBeenCalled();
    });

    it('should not reset any cache', () => {
      analyzer._resetCache();

      expect(analyzer._textProcessor.resetCache).not.toHaveBeenCalled();
      expect(analyzer._tagAccessor.resetCache).not.toHaveBeenCalled();
      expect(analyzer._wordCounter.resetCache).not.toHaveBeenCalled();
      expect(analyzer._strategy.resetCache).not.toHaveBeenCalled();
    });
  });

  test('fullRefresh() should handle cache reset globally', () => {
    analyzer._resetCache = jest.fn();
    analyzer.fullRefresh();

    expect(analyzer._resetCache).toHaveBeenCalledWith({
      text: true,
      tags: true,
      words: true,
      strategy: true
    });
  });

  afterAll(() => {
    delete global.KeywordAnalysisStrategy;
    delete global.Utils;
    delete global.sw;
  });
});
