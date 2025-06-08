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
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

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
      <p><strong style="display: inline;">Compound <em id="test" style="display: inline;">keyword</em></strong></p>
    `;
    controller = new KeywordController(iframeDoc);
  });

  test('should initialize controller with correct data', () => {
    const info = controller.overviewInfo;
    expect(info).toBeInstanceOf(OverviewInfo);
    expect(info.lang).toBe('en-US');
    expect(info.metaTagKeywordsContent).toBe('seo, accessibility, keyword');
    expect(info.wordCount).toBe(20);
    expect(info.uniqueWordCount).toBe(14);

    expect(controller.keywordLists.meta.original.map(k => k.name)).toEqual([
      'seo', 'accessibility', 'keyword'
    ]);
    expect(controller.keywordLists.meta.original[2].frequency).toBe(3);
    expect(controller.keywordLists.oneWord.original.map(k => k.name)).toEqual(expect.arrayContaining([
      'test', 'heading', 'keyword', 'here'
    ]));
    expect(controller.keywordLists.twoWords.original.map(k => k.name)).toEqual(expect.arrayContaining([
      'test heading', 'another test', 'keyword appears', 'keyword here', 'image alt'
    ]));
    expect(controller.keywordLists.twoWords.original[0].frequency).toBe(2);

    expect(controller.view.container).toBeInstanceOf(HTMLElement);
    expect(document.querySelector('.keywords__section--dashboard')).toBeTruthy();
    
    const overviewContainer = document.querySelector('.keywords__overview-container');
    expect(overviewContainer).toBeTruthy();
    expect(overviewContainer.querySelectorAll('.keywords__overview-icon--warning').length).toBe(0);

    expect(document.querySelector('.keywords__settings-container')).toBeTruthy();
    expect(document.querySelector('.keywords__input-container')).toBeTruthy();
    
    expect(document.querySelector('.keyword-all-lists__container')).toBeTruthy();
    let listContainer = document.querySelector('[data-list-type="meta"]');
    expect(listContainer).toBeTruthy();
    let button = listContainer.querySelector(`.keywords__sort-button[data-sort="desc"]`);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(false);
    expect(listContainer.querySelectorAll('.keywords__icon--error').length).toBe(2);

    listContainer = document.querySelector('[data-list-type="oneWord"]');
    expect(listContainer).toBeTruthy();
    button = listContainer.querySelector(`.keywords__sort-button[data-sort="desc"]`);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
    expect(listContainer.querySelectorAll('.keywords__icon--error').length).toBe(0);
  });

  describe('update', () => {
    beforeEach(() => {
      iframeDoc.head.innerHTML = `
        <title>This is a test</title>
        <meta name="description" content="keyword appears here">
      `;
      iframeDoc.body.innerHTML = `
        <h1>Test heading</h1>
        <h1>Another test heading</h1>
        <h2>test heading</h2>
        <p><strong style="display: inline;">Compound <em style="display: inline;">keyword</em></strong></p>
      `;
    });

    it('should update controller correctly with full refresh', () => {      
      controller.update(iframeDoc, true);

      const info = controller.overviewInfo;
      expect(info.lang).toBe('en-US');
      expect(info.metaTagKeywordsContent).toBe('');
      expect(info.wordCount).toBe(16);
      expect(info.uniqueWordCount).toBe(10);

      expect(controller.keywordLists.meta.original.length).toBe(0);
      expect(controller.keywordLists.oneWord.original[0].name).toBe('test');
      expect(controller.keywordLists.oneWord.original[0].frequency).toBe(4);
      expect(controller.keywordLists.oneWord.original[0].keywordOccurrences.h2).toBe(1);
      expect(controller.keywordLists.twoWords.original[0].name).toBe('test heading');
      expect(controller.keywordLists.twoWords.original[0].frequency).toBe(3);
      expect(controller.keywordLists.twoWords.original.map(k => k.name)).not.toEqual(
        expect.arrayContaining(['image alt'])
      );

      expect(controller.activeHighlightedKeyword).toBeNull();
      expect(controller.activeHighlightSource).toBeNull();
      expect(controller.view.activeHighlightButton).toBeNull();
      expect(controller.view.keywordHighlightCheckbox.checked).toBe(false);

      const overviewContainer = controller.view.body.querySelector('.keywords__overview-container');
      expect(overviewContainer.querySelectorAll('.keywords__overview-icon--warning').length).toBe(1);

      const listContainer = document.querySelector('[data-list-type="meta"]');
      expect(listContainer).toBeNull();
    });

    it('should update controller correctly with partial refresh', () => {
      controller.update(iframeDoc);

      const info = controller.overviewInfo;
      expect(info.metaTagKeywordsContent).not.toBe('');
      expect(info.wordCount).toBe(16);
      expect(info.uniqueWordCount).toBe(10);

      const overviewContainer = controller.view.body.querySelector('.keywords__overview-container');
      expect(overviewContainer.textContent).toContain('seo, accessibility, keyword');
      expect(overviewContainer.textContent).toContain('16');
      expect(overviewContainer.textContent).toContain('10');
      expect(overviewContainer.querySelectorAll('.keywords__overview-icon--warning').length).toBe(0);

      expect(controller.keywordLists.meta.original.length).toBeGreaterThan(0);
      expect(controller.keywordLists.meta.original[2].frequency).toBe(2);
    });
  });

  describe('toggle highlight from checkbox', () => {
    let keywordInput, checkbox;

    beforeEach(() => {
      keywordInput = controller.view.customKeywordInput;
      checkbox = controller.view.keywordHighlightCheckbox;
    });

    it('should highlight simple keyword', () => {
      keywordInput.value = '  test  ';
      checkbox.checked = true;
  
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      let highlights = iframeDoc.querySelectorAll('.w3ba11y__keyword-highlight');
      expect(highlights.length).toBe(2);
  
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      highlights = iframeDoc.querySelectorAll('.w3ba11y__keyword-highlight');
      expect(highlights.length).toBe(0);
    });
  
    it('should highlight compound keyword based on display property', () => {
      keywordInput.value = '  compound keyword  ';
      checkbox.checked = true;
  
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      let highlights = iframeDoc.querySelectorAll('.w3ba11y__keyword-highlight');
      expect(highlights.length).toBe(2);
  
      iframeDoc.getElementById('test').style.display = 'block';
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      highlights = iframeDoc.querySelectorAll('.w3ba11y__keyword-highlight');
      expect(highlights.length).toBe(0);
    });
  });

  test('should highlight keyword from list', () => {
    const listContainer = controller.view.getListViewByType('meta').container;
    const button = [...listContainer.querySelectorAll('.keyword-button--highlight')].at(-1);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const highlights = iframeDoc.querySelectorAll('.w3ba11y__keyword-highlight');
    expect(highlights.length).toBe(2);
    expect(button.classList.contains('keyword-button--highlight--active')).toBe(true);
    expect(controller.view.activeHighlightButton).toBe(button);
    expect(controller.activeHighlightedKeyword).toBe(controller.keywordLists.meta.original.at(-1));
    expect(controller.activeHighlightSource).toBe('list');
  });

  test('should analyze user added keyword', () => {
    const keywordInput = controller.view.customKeywordInput;
    const analyzeButton = controller.view.analyzeButton;

    expect(document.querySelector('[data-list-type="userAdded"]')).toBeNull();

    keywordInput.value = '  test  ';
    analyzeButton.click();

    expect(document.querySelector('[data-list-type="userAdded"]')).toBeTruthy();
    const listContainer = controller.view.getListViewByType('userAdded').container;
    expect(listContainer.querySelectorAll('.keyword-list li').length).toBe(1);
    expect(controller.keywordLists.userAdded.original[0].name).toBe('test');
    expect(controller.keywordLists.userAdded.original[0].frequency).toBe(3);

    keywordInput.value = 'compound keyword';
    analyzeButton.click();

    expect(controller.keywordLists.userAdded.original[1].name).toBe('compound keyword');
    expect(controller.keywordLists.userAdded.original[1].frequency).toBe(1);
    expect(controller.keywordLists.userAdded.original[1].keywordOccurrences.p).toBe(1);
    expect(controller.keywordLists.userAdded.original[1].keywordOccurrences.strong).toBe(1);
    expect(controller.keywordLists.userAdded.original[1].keywordOccurrences.em).toBe(0);
  });

  test('should render keyword details', () => {
    const listContainer = controller.view.getListViewByType('meta').container;
    const button = [...listContainer.querySelectorAll('.keyword-button--view-details')].at(-1);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const analysisContainer = controller.view.analysis.container;
    expect(analysisContainer).toBeTruthy();
    expect(analysisContainer.textContent).toContain('keyword');
    expect(analysisContainer.textContent).toContain('2');

    const highlightButton = analysisContainer.querySelector('.keyword-button--highlight');
    expect(highlightButton).toBeTruthy();
    expect(highlightButton.classList.contains('keyword-button--highlight--active')).toBe(false);

    highlightButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const highlights = iframeDoc.querySelectorAll('.w3ba11y__keyword-highlight');
    expect(highlights.length).toBe(2);
    expect(highlightButton.classList.contains('keyword-button--highlight--active')).toBe(true);
    expect(controller.view.activeHighlightButton).toBe(highlightButton);
    expect(controller.activeHighlightedKeyword).toBe(controller.keywordLists.meta.original.at(-1));
    expect(controller.activeHighlightSource).toBe('result');
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
