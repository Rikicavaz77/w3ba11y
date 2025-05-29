/**
 * @jest-environment jsdom
 */
const KeywordAnalyzer = require('../../services/keyword_analyzer');
const TreeWalkerManager = require('../../services/tree_walker_manager');
const TextProcessor = require('../../services/text_processor');
const TagAccessor = require('../../services/tag_accessor');
const WordCounter = require('../../services/word_counter');
const KeywordAnalysisStrategy = require('../../services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const AllInOneAnalysisStrategy = require('../../services/strategy/all_in_one_analysis_strategy');
const Keyword = require('../../model/keyword');
const Utils = require('../../utils/utils');
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
    const treeWalker = new TreeWalkerManager(document.body);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    const wordCounter = new WordCounter(textProcessor, tagAccessor);
    analyzer = new KeywordAnalyzer(textProcessor, tagAccessor, wordCounter, new AllInOneAnalysisStrategy());
  });

  test('countOccurrencesInTag() should return keyword occurrences in a specified tag', () => {
    const pattern = analyzer._textProcessor.getKeywordPattern('keyword');
    let count = analyzer.countOccurrencesInTag('p', pattern);
    expect(count).toBe(4);
  });

  describe('prepareAnalysisData()', () => {
    it('should get only text nodes', () => {
      const keywords = [new Keyword('keyword'), new Keyword('keyword')]
      analyzer._prepareAnalysisData(keywords);
      expect(analyzer._textNodes).toBeDefined();
      expect(analyzer._nodeGroups).toBeUndefined();
    });

    it('should get only node groups', () => {
      const keywords = [new Keyword('test keyword'), new Keyword('another test keyword')]
      analyzer._prepareAnalysisData(keywords);
      expect(analyzer._nodeGroups).toBeDefined();
      expect(analyzer._textNodes).toBeUndefined();
    });

    it('should get text nodes and node groups', () => {
      const keywords = [new Keyword('keyword'), new Keyword('test keyword')]
      analyzer._prepareAnalysisData(keywords);
      expect(analyzer._textNodes).toBeDefined();
      expect(analyzer._nodeGroups).toBeDefined();
    });
  });

  test('analyzeKeyword() should update keyword data correctly', () => {
    const spy = jest.spyOn(analyzer._strategy, 'reset');

    const keywords = [new Keyword('keyword'), new Keyword('compound keyword')];

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

    expect(analyzer._textNodes).toBeDefined();
    expect(analyzer._nodeGroups).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  test('analyzeKeywords() should process multiple keywords', () => {
    const spy = jest.spyOn(analyzer._strategy, 'reset');

    const keywords = [new Keyword('keyword'), new Keyword('appears'), new Keyword('keyword appears')];

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

    expect(analyzer._textNodes).toBeDefined();
    expect(analyzer._nodeGroups).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  afterAll(() => {
    delete global.KeywordAnalysisStrategy;
    delete global.Utils;
    delete global.sw;
  });
});
