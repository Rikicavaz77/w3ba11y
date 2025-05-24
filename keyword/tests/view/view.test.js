/**
 * @jest-environment jsdom
 */
const KeywordView = require('../../view/view');
const Keyword = require('../../model/keyword');
const KeywordListView = require('../../view/keyword_list_view');
global.KeywordListView = KeywordListView;
jest.mock('../../view/analysis_result_view');
const AnalysisResultView = require('../../view/analysis_result_view');
global.AnalysisResultView = AnalysisResultView;
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('KeywordView', () => {
  let view, keywords;

  beforeEach(() => {
    document.body.innerHTML = `
      <aside>
        <div class="w3ba11y__body"></div>
      </aside>
    `;

    view = new KeywordView(document);
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

  test('should make container null if aside body is missing', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    document.body.innerHTML = '';
    view = new KeywordView(document);
    expect(view.container).toBeNull();

    console.error.mockRestore();
  });

  test('should remove existing keyword section before appending new one', () => {
    document.body.querySelector('aside .w3ba11y__body').innerHTML = `
      <div class="w3ba11y__section w3ba11y__section--keyword"></div>
    `;
    const dummy = document.body.querySelector('.w3ba11y__section--keyword');

    view = new KeywordView(document);
    expect(document.body.contains(view.container)).toBe(true);
    expect(document.body.contains(dummy)).toBe(false);
  });

  test('setters should assign values correctly', () => {
    const dummy = {};

    view.header = dummy;
    view.body = dummy;
    view.tabButtons = dummy;
    view.activeTabButton = dummy;
    view.colorInputs = dummy;
    view.customKeywordInput = dummy;
    view.keywordHighlightCheckbox = dummy;
    view.analyzeButton = dummy;

    expect(view.header).toBe(dummy);
    expect(view.body).toBe(dummy);
    expect(view.tabButtons).toBe(dummy);
    expect(view.activeTabButton).toBe(dummy);
    expect(view.colorInputs).toBe(dummy);
    expect(view.customKeywordInput).toBe(dummy);
    expect(view.keywordHighlightCheckbox).toBe(dummy);
    expect(view.analyzeButton).toBe(dummy);
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
    let mockListView, keywordListInfo;

    beforeEach(() => {
      mockListView = {
        container: document.createElement('div'),
        render: jest.fn()
      }
      view.createListView = jest.fn().mockReturnValue(mockListView);

      keywordListInfo = {
        type: 'meta',
        title: 'Meta keywords',
        keywords: keywords,
        totalPages: 1
      };
    });

    it('should append list view container', () => {
      const appendSpy = jest.spyOn(Element.prototype, 'appendChild');
  
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
  
      keywordListInfo.type = 'userAdded';
      keywordListInfo.title = 'User added keywords';
  
      view.renderKeywordListContainer(keywordListInfo);
      expect(prependSpy).toHaveBeenCalledWith(mockListView.container);

      prependSpy.mockRestore();
    });

    it('should not append if container already exists', () => {
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

  describe('renderKeywordDetails()', () => {
    let mockContainer, mockRender;

    beforeEach(() => {
      mockContainer = document.createElement('div');
      mockRender = jest.fn();
      AnalysisResultView.mockImplementation(() => ({
        container: mockContainer,
        render: mockRender
      }));
    });

    test('should create and render AnalysisResultView if not present', () => {
      view.renderKeywordDetails(keywords[0]);
      expect(mockRender).toHaveBeenCalledWith(keywords[0]);
      expect(view.analysis).toBeDefined();

      view.renderKeywordDetails(keywords[1]);
      expect(mockRender).toHaveBeenCalledWith(keywords[1]);
      expect(AnalysisResultView).toHaveBeenCalledTimes(1);
    });

    test('should remove existing section before appending new one', () => {
      const dummy = document.createElement('div');
      dummy.classList.add('keywords__section--result');
      view.container.appendChild(dummy);

      view.renderKeywordDetails(keywords[0]);
      expect(view.container.contains(mockContainer)).toBe(true);
      expect(view.container.contains(dummy)).toBe(false);
    });
  });

  describe('changeTab()', () => {
    beforeEach(() => {
      view.render({
        metaTagKeywordsContent: '',
        lang: '',
        wordCount: 0,
        uniqueWordCount: 0
      }, {});
    });

    it('should switch active tab', () => {
      const overviewTabButton = view.overviewTabButton;
      const settingsTabButton = view.settingsTabButton;
      view.changeTab(settingsTabButton);
      expect(overviewTabButton.classList.contains('tab__button--active')).toBe(false);
      expect(view.overviewTab.classList.contains('tab--active')).toBe(false);
      expect(view.activeTabButton).toBe(settingsTabButton);
      expect(settingsTabButton.classList.contains('tab__button--active')).toBe(true);
      expect(view.settingsTab.classList.contains('tab--active')).toBe(true);
    });

    it('should not switch if tab already active', () => {
      const overviewTabButton = view.overviewTabButton;
      view.changeTab(overviewTabButton);
      expect(view.activeTabButton).toBe(overviewTabButton);
    });
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
    it('should create list view correctly', () => {
      ['meta', 'userAdded'].forEach(type => {
        const result = view.createListView({ title: 'Test', type: type, sortDirection: null });
        expect(result).toBeInstanceOf(KeywordListView);
        expect(result.container.dataset.listType).toBe(type);
        expect(result.sortDirection).toBeNull();
        expect(result.currentSortButton).toBeNull();
      });

      ['oneWord'].forEach(type => {
        const result = view.createListView({ title: 'Test', type: type, sortDirection: 'desc' });
        expect(result).toBeInstanceOf(KeywordListView);
        expect(result.container.dataset.listType).toBe(type);
        expect(result.sortDirection).toBe('desc');
        const button = result.container.querySelector('.keywords__sort-button[data-sort="desc"]');
        expect(result.currentSortButton).toBe(button);
        expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
      });
    });

    it('should return existing list view if already created', () => {
      ['meta', 'userAdded', 'oneWord'].forEach(type => {
        const first = view.createListView({ title: 'Test', type: type });
        const second = view.createListView({ title: 'Another test', type: type });
        expect(second).toBe(first);
      });
    });

    it('should return null for unknown type', () => {
      const result = view.createListView({ title: 'Unknonw', type: 'unsupportedType' });
      expect(result).toBeNull();
    });
  });

  test('render() should call internal rendering methods', () => {
    const overviewInfo = {
      metaTagKeywordsContent: '',
      lang: '',
      wordCount: 0,
      uniqueWordCount: 0
    };
    const colorMap = {
      strong: { bg: '#e6320e', color: '#000000', border: '#000000' },
    };

    view.renderKeywordAnalysisOverview = jest.fn();
    view.renderKeywordSettings = jest.fn();
    view.renderKeywordInputBox = jest.fn();

    view.render(overviewInfo, colorMap);

    expect(view.renderKeywordAnalysisOverview).toHaveBeenCalledWith(overviewInfo);
    expect(view.renderKeywordSettings).toHaveBeenCalledWith(colorMap);
    expect(view.renderKeywordInputBox).toHaveBeenCalled();
  });

  test('toggleSection() should activate correct section and scroll', () => {
    const mockSection = document.createElement('div');
    mockSection.classList.add('keywords__section', 'keywords__section--test');
    view.container.appendChild(mockSection);
    
    const header = document.createElement('div');
    header.classList.add('w3ba11y__header');
    header.scrollIntoView = jest.fn();
    document.body.querySelector('aside').prepend(header);

    view.toggleSection('test');
    expect(view.dashboardSection.classList.contains('keywords__section--active')).toBe(false);
    expect(mockSection.classList.contains('keywords__section--active')).toBe(true);
    expect(header.scrollIntoView).toHaveBeenCalled();
  });

  test('showTooltip() should make tooltip visible', () => {
    view.renderKeywordSettings({});
    const trigger = view.tooltipsTrigger[0];
    const tooltip = view.tooltips[0];

    const event = { target: trigger };
    view.showTooltip(event);
    expect(tooltip.classList.contains('keywords--not-visible')).toBe(false);
  });

  test('hideTooltip() should make tooltip not visible', () => {
    view.renderKeywordSettings({});
    const trigger = view.tooltipsTrigger[0];
    const tooltip = view.tooltips[0];
    tooltip.classList.remove('keywords--not-visible');

    const event = { target: trigger };
    view.hideTooltip(event);
    expect(tooltip.classList.contains('keywords--not-visible')).toBe(true);
  });

  test('hideAllTooltips() should add hidden class to all tooltips', () => {
    const tooltip1 = document.createElement('span');
    tooltip1.classList.add('keywords__tooltip-text');
    const tooltip2 = document.createElement('span');
    tooltip2.classList.add('keywords__tooltip-text');
    view.container.appendChild(tooltip1);
    view.container.appendChild(tooltip2);
    
    view.hideAllTooltips();
    expect(tooltip1.classList.contains('keywords--not-visible')).toBe(true);
    expect(tooltip2.classList.contains('keywords--not-visible')).toBe(true);
  });

  test('getAllSection() should return all sections', () => { 
    const sections = view.getAllSection();
    expect(sections.length).toBe(1);
    expect(sections[0]).toBe(view.dashboardSection);
  });

  test('getSection() should return the section by class', () => { 
    const section = view.getSection('dashboard');
    expect(section).toBeTruthy();
    expect(section).toBe(view.dashboardSection);
  });

  afterAll(() => {
    delete global.KeywordListView;
    delete global.AnalysisResultView;
    delete global.Utils;
  }); 
});
