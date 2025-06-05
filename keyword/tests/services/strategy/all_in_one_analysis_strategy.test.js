/**
 * @jest-environment jsdom
 */
const KeywordAnalysisStrategy = require('../../../services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const AllInOneAnalysisStrategy = require('../../../services/strategy/all_in_one_analysis_strategy');
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

describe('AllInOneAnalysisStrategy', () => {
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
    strategy = new AllInOneAnalysisStrategy();
    const analyzer = new KeywordAnalyzer(textProcessor, tagAccessor, wordCounter, strategy);
    strategy.setContext(analyzer);
    simpleKeyword = new Keyword('keyword');
    compoundKeyword = new Keyword('compound keyword');
  });

  test('reset() should restore cache', () => {
    const ancestorCache = strategy._ancestorCache;
    const currentAncestorCache = strategy.reset();
    expect(currentAncestorCache).not.toBe(ancestorCache);
  });

  describe('findAncestors()', () => {
    it('should find all valid ancenstors', () => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const em = document.createElement('em');
      strong.appendChild(em);
      p.appendChild(strong);
      const textNode = document.createTextNode('Javascript');
      em.appendChild(textNode);

      strategy.reset();
      const ancestors = strategy._findAncestors(textNode);
      expect(ancestors).toContain(p, strong, em);
    });

    it('should return an empty array if no valid ancenstors', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      div.appendChild(span);
      const textNode = document.createTextNode('Javascript');
      span.appendChild(textNode);

      strategy.reset();
      const ancestors = strategy._findAncestors(textNode);
      expect(ancestors).toEqual([]);
    });
  }); 

  describe('getCommonAncestors()', () => {
    it('should return valid common ancestors', () => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const em = document.createElement('em');
      strong.appendChild(em);
      p.appendChild(strong);
      const firstTextNode = document.createTextNode('Javascript ');
      const secondTextNode = document.createTextNode('Tutorial');
      em.appendChild(firstTextNode);
      strong.appendChild(secondTextNode);
      const textNodes = [firstTextNode, secondTextNode];
  
      strategy.reset();
      const commonAncestors = strategy._getCommonAncestors(textNodes);
      expect(commonAncestors).toContain(p, strong);
      expect(commonAncestors).not.toContain(em);
    });

    it('should return an empty array if no valid common ancenstors', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      div.appendChild(span);
      const firstTextNode = document.createTextNode('Javascript ');
      const secondTextNode = document.createTextNode('Tutorial');
      span.appendChild(firstTextNode);
      div.appendChild(secondTextNode);
      const textNodes = [firstTextNode, secondTextNode];
  
      strategy.reset();
      const commonAncestors = strategy._getCommonAncestors(textNodes);
      expect(commonAncestors).toEqual([]);
    });
  });

  test('updateOccurrencesByAncestors() should update keyword occurrences correctly', () => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const ancestors = [p, strong];
    const keywordOccurrences = {};

    strategy._updateOccurrencesByAncestors(ancestors, keywordOccurrences, 8);
    expect(keywordOccurrences.p).toBe(8);
    expect(keywordOccurrences.strong).toBe(8);

    strategy._updateOccurrencesByAncestors(ancestors, keywordOccurrences);
    expect(keywordOccurrences.p).toBe(9);
    expect(keywordOccurrences.strong).toBe(9);
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
