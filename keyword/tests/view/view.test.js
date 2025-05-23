/**
 * @jest-environment jsdom
 */
const KeywordView = require('../../view/view');
const Keyword = require('../../model/keyword');
const KeywordListView = require('../../view/keyword_list_view');
global.KeywordListView = KeywordListView;
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('KeywordView', () => {
  let view, mockListView, keywords;

  beforeEach(() => {
    document.body.innerHTML = `
      <aside>
        <div class="w3ba11y__body"></div>
      </aside>
    `;

    view = new KeywordView(document);
    
    mockListView = {
      container: document.createElement('div'),
      render: jest.fn()
    }
    view.createListView = jest.fn().mockReturnValue(mockListView);
    keywords = [new Keyword('test'), new Keyword('another test')];
  });

  test('should initialize container and internal refs', () => {
    expect(view.container).toBeInstanceOf(HTMLElement);
    expect(view.header).toBeInstanceOf(HTMLElement);
    expect(view.body).toBeInstanceOf(HTMLElement);
    expect(view.tabButtons.length).toBeGreaterThan(0);
    expect(view.activeTabButton.classList.contains('tab__button--overview')).toBe(true);
    expect(view.iframe).toBe(document);
  });

  test('renderKeywordAnalysisOverview() should create overview container', () => {
    const overviewInfo = {
      metaTagKeywordsContent: 'test, another test',
      lang: 'en-US',
      wordCount: 2000,
      uniqueWordCount: 1000
    };

    view.renderKeywordAnalysisOverview(overviewInfo);
    const overview = view.body.querySelector('.keywords__overview-container');
    expect(overview).toBeTruthy();
    expect(overview.textContent).toContain('test, another test');
    expect(overview.textContent).toContain('en-US');
    expect(overview.textContent).toContain('2000');
    expect(overview.textContent).toContain('1000');

    const anotherOverviewInfo = {
      metaTagKeywordsContent: '',
      lang: '',
      wordCount: 100,
      uniqueWordCount: 50
    };

    view.renderKeywordAnalysisOverview(anotherOverviewInfo);
    expect(view.body.querySelectorAll('.keywords__overview-container').length).toBe(1);
    const matches = view.body.querySelector('.keywords__overview-container').textContent.match(/Missing/gi);
    expect(matches.length).toBe(2);
  });

  test('renderKeywordSettings() should create settings container and populate with color inputs', () => {
    const colorMap = {
      p: { bg: '#ff0000', color: '#000000', border: '#000000' },
      h1: { bg: '#00ff00', color: '#000000', border: '#000000' }
    };

    view.renderKeywordSettings(colorMap);

    const settings = view.body.querySelector('.keywords__settings-container');
    expect(settings).toBeTruthy();
    expect(settings.innerHTML).toContain('highlight-bg-p');
    expect(settings.innerHTML).toContain('highlight-color-h1');
    expect(settings.innerHTML).toContain('highlight-border-h1');
    expect(view.colorInputs.length).toBe(6);
    
    const anotherColorMap = {
      strong: { bg: '#e6320e', color: '#000000', border: '#000000' },
    };

    view.renderKeywordSettings(anotherColorMap);
    expect(view.body.querySelectorAll('.keywords__settings-container').length).toBe(1);
  });

  test('renderKeywordInputBox() should create input container', () => {
    view.renderKeywordInputBox();

    const box = view.body.querySelector('.keywords__input-container');
    expect(box).toBeTruthy();
    expect(view.customKeywordInput).not.toBeNull();
    expect(view.customKeywordInput.classList.contains('keywords__input-wrapper__field')).toBe(true);
    expect(view.keywordHighlightCheckbox).not.toBeNull();
    expect(view.keywordHighlightCheckbox.classList.contains('keywords__highlight-input')).toBe(true);
    expect(view.analyzeButton).not.toBeNull();
    expect(view.analyzeButton.classList.contains('keywords__analyze-button')).toBe(true);

    view.renderKeywordInputBox();
    expect(view.body.querySelectorAll('.keywords__input-container').length).toBe(1);
  });

  describe('renderKeywordListContainer()', () => {
    it('should append list view container', () => {
      const appendSpy = jest.spyOn(Element.prototype, 'appendChild');
  
      const keywordListInfo = {
        type: 'meta',
        title: 'Meta keywords',
        keywords: keywords,
        totalPages: 1
      };
  
      view.renderKeywordListContainer(keywordListInfo);
      const all = view.body.querySelector('.keyword-all-lists__container');
      expect(all).toBeTruthy();
      expect(all.contains(mockListView.container)).toBe(true);
      expect(mockListView.render).toHaveBeenCalledWith(keywords, 1);
      expect(appendSpy).toHaveBeenCalledTimes(2);
      appendSpy.mockRestore();
    });

    it('should prepend list view container', () => {
      const prependSpy = jest.spyOn(Element.prototype, 'prepend');
  
      const keywordListInfo = {
        type: 'userAdded',
        title: 'User added keywords',
        keywords: keywords,
        totalPages: 1
      };
  
      view.renderKeywordListContainer(keywordListInfo);
      expect(prependSpy).toHaveBeenCalledWith(mockListView.container);
      prependSpy.mockRestore();
    });

    it('should not append if container already exists', () => {
      const keywordListInfo = {
        type: 'meta',
        title: 'Meta keywords',
        keywords: keywords,
        totalPages: 1
      };

      const all = document.createElement('div');
      all.classList.add('keyword-all-lists__container');
      const existing = document.createElement('div');
      existing.dataset.listType = 'meta';
      all.appendChild(existing);
      view.body.appendChild(all);

      view.renderKeywordListContainer(keywordListInfo);
      expect(mockListView.render).toHaveBeenCalled();
      expect(view.body.querySelectorAll('.keyword-all-lists__container').length).toBe(1);
      expect(all.querySelectorAll('[data-list-type="meta"]').length).toBe(1);
    });
  });

  test('changeTab() should switch active tab', () => {
    const overviewTab = view.overviewTabButton;
    const settingsTab = view.settingsTabButton;
    view.render({
      metaTagKeywordsContent: '',
      lang: '',
      wordCount: 0,
      uniqueWordCount: 0
    }, {});
    view.changeTab(settingsTab);
    expect(overviewTab.classList.contains('tab__button--active')).toBe(false);
    expect(view.container.querySelector('.tab--overview').classList.contains('tab--active')).toBe(false);
    expect(view.activeTabButton).toBe(settingsTab);
    expect(settingsTab.classList.contains('tab__button--active')).toBe(true);
    expect(view.container.querySelector('.tab--settings').classList.contains('tab--active')).toBe(true);
  });

  test('getListViewByType() should return correct list view', () => {
    view._metaKeywordsListView = { listType: 'meta' };
    view._userKeywordsListView = { listType: 'userAdded' };
    view._oneWordKeywordsListView = { listType: 'oneWord' };
    
    expect(view.getListViewByType('meta')).toEqual({ listType: 'meta' });
    expect(view.getListViewByType('userAdded')).toEqual({ listType: 'userAdded' });
    expect(view.getListViewByType('oneWord')).toEqual({ listType: 'oneWord' });
    expect(view.getListViewByType('unknown')).toBeNull();
  });
  
  describe('createListView()', () => {
    beforeEach(() => {
      view.createListView = KeywordView.prototype.createListView.bind(view);
    });

    it('should create list view correctly', () => {
      const result = view.createListView({ title: 'Test', type: 'meta' });
      expect(result).toBeInstanceOf(KeywordListView);
      expect(result.container.dataset.listType).toBe('meta');
    });

    it('should return existing list view if already created', () => {
      const first = view.createListView({ title: 'Test', type: 'meta' });
      const second = view.createListView({ title: 'Another test', type: 'meta' });
      expect(second).toBe(first);
    });
  });

  afterAll(() => {
    delete global.KeywordListView;
    delete global.Utils;
  }); 
});
