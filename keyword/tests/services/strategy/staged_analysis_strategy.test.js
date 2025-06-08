/**
 * @jest-environment jsdom
 */
const KeywordAnalysisStrategy = require('../../../services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const StagedAnalysisStrategy = require('../../../services/strategy/staged_analysis_strategy');
const KeywordAnalyzer = require('../../../services/keyword_analyzer');
const TreeWalkerManager = require('../../../services/tree_walker_manager');
const TextProcessor = require('../../../services/text_processor');
const TagAccessor = require('../../../services/tag_accessor');
const WordCounter = require('../../../services/word_counter');
const Keyword = require('../../../model/keyword');
const Utils = require('../../../utils/utils');
global.Utils = Utils;

global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('StagedAnalysisStrategy', () => {
  let strategy, simpleKeyword, compoundKeyword;

  beforeEach(() => {
    document.body.innerHTML = `
      <h1>This is a test keyword</h1>
      <p>Another keyword appears here</p>
      <p>Compound keyword appears in the same tag</p>
      <p><strong style="display: inline;">Compound <em style="display: inline;">keyword</em></strong> appears in two different tags</p>
    `;
    const treeWalker = new TreeWalkerManager(document);
    const textProcessor = new TextProcessor(document, treeWalker);
    const tagAccessor = new TagAccessor(document);
    const wordCounter = new WordCounter(textProcessor, tagAccessor);
    strategy = new StagedAnalysisStrategy();
    const analyzer = new KeywordAnalyzer(textProcessor, tagAccessor, wordCounter, strategy);
    strategy.setContext(analyzer);
    simpleKeyword = new Keyword('keyword');
    compoundKeyword = new Keyword('compound keyword');
  });

  test('resetCache() should do nothing', () => {
    const result = strategy.resetCache();
    expect(result).toBeUndefined();
  });

  test('analyzeSimpleKeyword() should count keyword occurrences', () => {
    const pattern = strategy._context._textProcessor.getKeywordPattern(simpleKeyword.name);
    const textNodes = strategy._context._textProcessor.getTextNodes();
    strategy.analyzeSimpleKeyword(textNodes, pattern, simpleKeyword);
    expect(simpleKeyword.frequency).toBe(4);
    expect(simpleKeyword.keywordOccurrences.h1).toBe(1);
    expect(simpleKeyword.keywordOccurrences.h2).toBe(0);
    expect(simpleKeyword.keywordOccurrences.p).toBe(3);
    expect(simpleKeyword.keywordOccurrences.strong).toBe(1);
    expect(simpleKeyword.keywordOccurrences.em).toBe(1);
  });

  test('analyzeCompoundKeyword() should count keyword occurrences', () => {
    const pattern = strategy._context._textProcessor.getKeywordPattern(compoundKeyword.name);
    const nodeGroups = strategy._context._textProcessor.getTextNodeGroups();
    strategy.analyzeCompoundKeyword(nodeGroups, pattern, compoundKeyword);
    expect(compoundKeyword.frequency).toBe(2);
    expect(compoundKeyword.keywordOccurrences.p).toBe(2);
    expect(compoundKeyword.keywordOccurrences.strong).toBe(1);
    expect(compoundKeyword.keywordOccurrences.em).toBe(0);
  });

  afterAll(() => {
    delete global.KeywordAnalysisStrategy;
    delete global.Utils;
    delete global.sw;
  });
});
