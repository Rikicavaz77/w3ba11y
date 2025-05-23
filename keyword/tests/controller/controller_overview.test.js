/**
 * @jest-environment jsdom
 */
const KeywordController = require('../../controller/controller');
const OverviewInfo = require('../../model/overview_info');
global.OverviewInfo = OverviewInfo;
const KeywordListInfo = require('../../model/keyword_list_info');
global.KeywordListInfo = KeywordListInfo;
const Keyword = require('../../model/keyword');
global.Keyword = Keyword;
const Utils = require('../../utils/utils');
global.Utils = Utils;
const KeywordView = require('../../view/view');
global.KeywordView = KeywordView;
const KeywordListView = require('../../view/keyword_list_view');
global.KeywordListView = KeywordListView;
const TreeWalkerManager = require('../../services/tree_walker_manager');
global.TreeWalkerManager = TreeWalkerManager;
const TextProcessor = require('../../services/text_processor');
global.TextProcessor = TextProcessor;
const TagAccessor = require('../../services/tag_accessor');
global.TagAccessor = TagAccessor;
const KeywordHighlighter = require('../../services/keyword_highlighter');
global.KeywordHighlighter = KeywordHighlighter;
const WordCounter = require('../../services/word_counter');
global.WordCounter = WordCounter;
const KeywordAnalysisStrategy = require('../../services/strategy/keyword_analysis_strategy');
global.KeywordAnalysisStrategy = KeywordAnalysisStrategy;
const AllInOneAnalysisStrategy = require('../../services/strategy/all_in_one_analysis_strategy');
global.AllInOneAnalysisStrategy = AllInOneAnalysisStrategy;
const KeywordAnalyzer = require('../../services/keyword_analyzer');
global.KeywordAnalyzer = KeywordAnalyzer;

global.sw = {
  eng: ['the', 'and', 'is'],
  ita: ['il', 'la', 'e']
};

describe('KeywordController - overview', () => {
  let iframeDoc, controller;

  beforeEach(() => {
    document.body.innerHTML = `
      <aside>
        <div class="w3ba11y__body"></div>
      </aside>
    `;
    iframeDoc = document.implementation.createHTMLDocument('iframe');
    iframeDoc.head.innerHTML = `
      <title>This is a test</title>
      <meta name="keywords" content="seo, accessibility, keyword">
      <meta name="description" content="keyword appears here">
    `;
    iframeDoc.documentElement.lang = 'en-US';
    iframeDoc.body.innerHTML = `
      <h1>Test heading</h1>
      <h1>Another test heading</h1>
      <img src="test.jpg" alt="Image alt text">
    `;
    controller = new KeywordController(iframeDoc);
  });

  test('createOverview() should set OverviewInfo with correct values', () => {
    controller.createOverview();
    const info = controller.overviewInfo;

    expect(info).toBeInstanceOf(OverviewInfo);
    expect(info.lang).toBe('en-US');
    expect(info.metaTagKeywordsContent).toBe('seo, accessibility, keyword');
    expect(info.wordCount).toBe(15);
    expect(info.uniqueWordCount).toBe(12);
  });

  afterAll(() => {
    delete global.OverviewInfo;
    delete global.KeywordListInfo;
    delete global.Keyword;
    delete global.Utils;
    delete global.KeywordView;
    delete global.KeywordListView;
    delete global.TreeWalkerManager;
    delete global.TextProcessor;
    delete global.TagAccessor;
    delete global.KeywordHighlighter;
    delete global.WordCounter;
    delete global.KeywordAnalysisStrategy;
    delete global.AllInOneAnalysisStrategy;
    delete global.KeywordAnalyzer;
    delete global.sw;
  });
});