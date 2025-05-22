/**
 * @jest-environment jsdom
 */
const KeywordAnalysisStrategy = require('../services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const AllInOneAnalysisStrategy = require('../services/strategy/all_in_one_analysis_strategy');
const KeywordAnalyzer = require('../services/keyword_analyzer');
const TextProcessor = require('../services/text_processor');
const TreeWalkerManager = require('../services/tree_walker_manager');
const TagAccessor = require('../services/tag_accessor');
const WordCounter = require('../services/word_counter');
const Keyword = require('../model/keyword');
const Utils = require('../utils/utils');

global.Utils = {
  escapeRegExp: Utils.escapeRegExp
};
global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('AllInOneAnalysisStrategy', () => {
  let strategy, keyword;

  beforeEach(() => {
    document.body.innerHTML = `
      <h1>This is a test keyword</h1>
      <p>Another keyword appears here</p>
    `;
    const treeWalker = new TreeWalkerManager(document.body);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    const wordCounter = new WordCounter(textProcessor, tagAccessor);
    strategy = new AllInOneAnalysisStrategy();
    const analyzer = new KeywordAnalyzer(textProcessor, tagAccessor, wordCounter, strategy);
    strategy.setContext(analyzer);
    keyword = new Keyword('keyword');
  });

  test('analyze() should count keyword occurrences', () => {
    const pattern = strategy._context._textProcessor.getKeywordPattern(keyword.name);
    const textNodes = strategy._context._textProcessor.getTextNodes();
    strategy.analyze(textNodes, pattern, keyword);
    expect(keyword.frequency).toBe(2);
    expect(keyword.keywordOccurrences.h1).toBe(1);
    expect(keyword.keywordOccurrences.p).toBe(1);
    expect(keyword.keywordOccurrences.h2).toBe(0);
  });

  afterAll(() => {
    delete global.KeywordAnalysisStrategy;
    delete global.Utils;
    delete global.sw;
  });
});
