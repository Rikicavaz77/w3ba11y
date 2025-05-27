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
const AnalysisResultView = require('../../view/analysis_result_view');
global.AnalysisResultView = AnalysisResultView;
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
  eng: ['the', 'and', 'is', 'a'],
  ita: ['il', 'la', 'e']
};

describe('KeywordController - init', () => {
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
      <p>Keyword here too</p>
      <img src="test.jpg" alt="Image alt text">
    `;
    controller = new KeywordController(iframeDoc);
  });

  test('should initialize controller with correct data', () => {
    const info = controller.overviewInfo;
    expect(info).toBeInstanceOf(OverviewInfo);
    expect(info.lang).toBe('en-US');
    expect(info.metaTagKeywordsContent).toBe('seo, accessibility, keyword');
    expect(info.wordCount).toBe(18);
    expect(info.uniqueWordCount).toBe(13);

    expect(controller.metaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
    expect(controller.metaKeywords[2].frequency).toBe(2);
    expect(controller.oneWordKeywords.map(k => k.name)).toEqual(expect.arrayContaining(['test', 'heading', 'keyword', 'here']));

    expect(controller.view.container).toBeInstanceOf(HTMLElement);
    expect(document.querySelector('.keywords__section--dashboard')).toBeTruthy();
    expect(document.querySelector('.keywords__overview-container')).toBeTruthy();
    expect(document.querySelector('.keywords__settings-container')).toBeTruthy();
    expect(document.querySelector('.keywords__input-container')).toBeTruthy();
    expect(document.querySelector('.keyword-all-lists__container')).toBeTruthy();
    let listContainer = document.querySelector('[data-list-type="meta"]');
    expect(listContainer).toBeTruthy();
    let button = listContainer.querySelector(`.keywords__sort-button[data-sort="desc"]`);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(false);
    listContainer = document.querySelector('[data-list-type="oneWord"]');
    expect(listContainer).toBeTruthy();
    button = listContainer.querySelector(`.keywords__sort-button[data-sort="desc"]`);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
  });

  test('should highlight keyword on input and checkbox', () => {
    const keywordInput = controller.view.customKeywordInput;
    const checkbox = controller.view.keywordHighlightCheckbox;

    keywordInput.value = 'test';
    checkbox.checked = true;

    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    let highlights = iframeDoc.querySelectorAll('.w3ba11y__highlight-keyword');
    expect(highlights.length).toBe(2);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    highlights = iframeDoc.querySelectorAll('.w3ba11y__highlight-keyword');
    expect(highlights.length).toBe(0);
  });

  test('should highlight keyword from list', () => {
    const listContainer = controller.view.getListViewByType('meta').container;
    const button = [...listContainer.querySelectorAll('.keyword-button--highlight')].at(-1);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const highlights = iframeDoc.querySelectorAll('.w3ba11y__highlight-keyword');
    expect(highlights.length).toBe(1);
  });

  test('should analyze user added keyword', () => {
    const keywordInput = controller.view.customKeywordInput;
    const analyzeButton = controller.view.analyzeButton;

    expect(document.querySelector('[data-list-type="userAdded"]')).toBeNull();

    keywordInput.value = 'test';
    analyzeButton.click();

    expect(document.querySelector('[data-list-type="userAdded"]')).toBeTruthy();
    const listContainer = controller.view.getListViewByType('userAdded').container;
    expect(listContainer.querySelectorAll('.keyword-list li').length).toBe(1);
    expect(controller.userKeywords[0].name).toBe('test');
    expect(controller.userKeywords[0].frequency).toBe(3);
  });

  test('should render keyword details', () => {
    const listContainer = controller.view.getListViewByType('meta').container;
    const button = [...listContainer.querySelectorAll('.keyword-button--view-details')].at(-1);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const analysisContainer = controller.view.analysis.container;
    expect(analysisContainer).toBeTruthy();
    expect(analysisContainer.innerHTML).toContain('keyword');
    expect(analysisContainer.innerHTML).toContain('2');
    expect(analysisContainer.querySelectorAll('.keyword_occurrences-icon--warning').length).toBe(12);
  });

  afterAll(() => {
    delete global.OverviewInfo;
    delete global.KeywordListInfo;
    delete global.Keyword;
    delete global.Utils;
    delete global.KeywordView;
    delete global.KeywordListView;
    delete global.AnalysisResultView;
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
