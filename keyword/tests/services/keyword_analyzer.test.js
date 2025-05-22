/**
 * @jest-environment jsdom
 */
const KeywordAnalyzer = require('../../services/keyword_analyzer');
const TextProcessor = require('../../services/text_processor');
const TreeWalkerManager = require('../../services/tree_walker_manager');
const TagAccessor = require('../../services/tag_accessor');
const WordCounter = require('../../services/word_counter');
const KeywordAnalysisStrategy = require('../../services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const AllInOneAnalysisStrategy = require('../../services/strategy/all_in_one_analysis_strategy');
const Keyword = require('../../model/keyword');
const Utils = require('../../utils/utils');

global.Utils = {
  escapeRegExp: Utils.escapeRegExp
};
global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('KeywordAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    document.head.innerHTML = '';
    const title = document.createElement('title');
    title.innerText = 'Keyword appears in the title';
    document.head.appendChild(title);
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Keyword here too';
    document.head.appendChild(meta);
    document.body.innerHTML = `
      <p>This is a test keyword.</p>
      <script>document.getElementById("keyword");</script>
      <p>Another keyword appears here.</p>
      <img src="test.jpg" alt="keyword in alt tag">
    `;
    const treeWalker = new TreeWalkerManager(document.body);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    const wordCounter = new WordCounter(textProcessor, tagAccessor);
    analyzer = new KeywordAnalyzer(textProcessor, tagAccessor, wordCounter, new AllInOneAnalysisStrategy());
  });

  test('analyzeKeyword() should update keyword data correctly', () => {
    const keyword = new Keyword('keyword');
    analyzer.analyzeKeyword(keyword);
    expect(keyword.frequency).toBe(5);
    expect(keyword.keywordOccurrences.title).toBe(1);
    expect(keyword.keywordOccurrences.description).toBe(1);
    expect(keyword.keywordOccurrences.p).toBe(2);
    expect(keyword.keywordOccurrences.alt).toBe(1);
    expect(keyword.keywordOccurrences.h1).toBe(0);
    expect(keyword.density).toBeCloseTo(23.81);
    expect(keyword.relevanceScore).toBeGreaterThan(0);
    expect(keyword.status).toBe('done');
  });

  test('analyzeKeywords() should process multiple keywords', () => {
    const keyword1 = new Keyword('keyword');
    const keyword2 = new Keyword('here');
    const keyword3 = new Keyword('appears');
    analyzer.analyzeKeywords([keyword1, keyword2, keyword3]);
    expect(keyword1.frequency).toBe(5);
    expect(keyword2.frequency).toBe(2);
    expect(keyword3.frequency).toBe(2);
    expect(keyword1.keywordOccurrences.title).toBe(1);
    expect(keyword2.keywordOccurrences.title).toBe(0);
    expect(keyword3.keywordOccurrences.title).toBe(1);
    expect(keyword1.keywordOccurrences.description).toBe(1);
    expect(keyword2.keywordOccurrences.description).toBe(1);
    expect(keyword3.keywordOccurrences.description).toBe(0);
  });

  afterAll(() => {
    delete global.KeywordAnalysisStrategy;
    delete global.Utils;
    delete global.sw;
  });
});
