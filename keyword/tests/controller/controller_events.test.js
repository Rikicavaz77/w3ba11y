/**
 * @jest-environment jsdom
 */
const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');
global.Keyword = Keyword;

describe('KeywordController - events', () => {
  let controller;

  beforeEach(() => {
    const mockView = {
      container: document.createElement('div'),
      customKeywordInput: document.createElement('input'),
      keywordHighlightCheckbox: document.createElement('input'),
      analyzeButton: document.createElement('button'),
      tabButtons: [document.createElement('button')],
      tooltipsTrigger: [document.createElement('div')],
      tooltips: [document.createElement('div')],
      changeTab: jest.fn(),
      showTooltip: jest.fn(),
      hideTooltip: jest.fn(),
      hideAllTooltips: jest.fn(),
      getListViewByType: jest.fn(),
      renderKeywordDetails: jest.fn(),
      toggleSection: jest.fn(),
      analysis: {
        currentKeywordItem: new Keyword('analysis keyword')
      }
    };

    controller = Object.create(KeywordController.prototype);
    controller.view = mockView;

    controller.eventHandlers = {
      changeTab: jest.fn(),
      showTooltip: jest.fn(),
      hideTooltip: jest.fn(),
      clearHighlightCheckbox: jest.fn(),
      analyzeKeyword: jest.fn()
    };

    controller.updateHighlightColors = jest.fn();
    controller.getListType = jest.fn().mockReturnValue('meta');
    controller.getKeywordIndex = jest.fn().mockReturnValue(0);
    controller.updateVisibleKeywords = jest.fn();
    controller.clearHighlightCheckbox = jest.fn();
    controller.getKeywordItem = jest.fn().mockReturnValue(new Keyword('test'));
    controller.changePage = jest.fn();
    controller.handleKeywordSorting = jest.fn();
    controller.removeFilters = jest.fn();
    controller.deleteKeyword = jest.fn();
    controller.handleHighlightClick = jest.fn();
    controller.getActiveHighlightData = jest.fn();
    controller.resetHighlightState = jest.fn();
    controller.keywordHighlighter = {
      highlightKeyword: jest.fn(),
      removeHighlight: jest.fn()
    };
  });

  test('bindColorPicker() should attach color input handler', () => {
    controller.bindColorPicker();
    const input = document.createElement('input');
    input.type = 'color';
    input.dataset.highlight = 'true';
    input.dataset.tag = 'p';
    input.dataset.prop = 'bg';
    input.value = '#ffff00';
    controller.view.container.appendChild(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(controller.updateHighlightColors).toHaveBeenCalledTimes(1);
    const arg = controller.updateHighlightColors.mock.calls[0][0];
    expect(arg.target.dataset.tag).toBe('p');
    expect(arg.target.dataset.prop).toBe('bg');
    expect(arg.target.value).toBe('#ffff00');
  });

  test('bindKeywordInputChange() should attach input handler', () => {
    controller.bindKeywordInputChange();
    controller.view.customKeywordInput.dispatchEvent(new Event('input'));
    expect(controller.eventHandlers.clearHighlightCheckbox).toHaveBeenCalled();
  });

  test('bindHighlightToggle() should toggle highlight', () => {
    const spy = jest.spyOn(controller, 'toggleHighlight');
    controller.eventHandlers.toggleHighlight = controller.toggleHighlight.bind(controller);

    controller.bindHighlightToggle();
    controller.view.customKeywordInput.value = '  test  ';
    controller.view.keywordHighlightCheckbox.checked = true;
    controller.view.keywordHighlightCheckbox.dispatchEvent(new Event('change'));
    expect(controller.resetHighlightState).toHaveBeenCalled();
    expect(controller.keywordHighlighter.highlightKeyword).toHaveBeenCalledWith('test');
    
    controller.view.keywordHighlightCheckbox.checked = false;
    controller.view.keywordHighlightCheckbox.dispatchEvent(new Event('change'));
    expect(controller.resetHighlightState).toHaveBeenCalled();
    expect(controller.keywordHighlighter.removeHighlight).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  test('bindAnalyzeKeyword() should trigger analysis', () => {
    controller.bindAnalyzeKeyword();
    controller.view.customKeywordInput.value = '  test  ';
    controller.view.analyzeButton.click();
    expect(controller.eventHandlers.analyzeKeyword).toHaveBeenCalled();
  });
  
  test('bindSearchInput() should filter keywords', () => {
    controller.bindSearchInput();
    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.search = 'true';
    input.value = 'test';
    controller.view.container.appendChild(input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(controller.updateVisibleKeywords).toHaveBeenCalledWith('meta', 'test');
  });

  test('bindGlobalShortcuts() should filter keywords', () => {
    controller.bindGlobalShortcuts();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(controller.view.hideAllTooltips).toHaveBeenCalled();
  });

  test('setupTabListeners() should handle tab change', () => {
    controller.setupTabListeners();
    controller.view.tabButtons[0].click();
    expect(controller.eventHandlers.changeTab).toHaveBeenCalled();
  });

  test('setupTooltipListeners() should handle tooltips', () => {
    controller.setupTooltipListeners();
    const tooltip = controller.view.tooltipsTrigger[0];
    tooltip.dispatchEvent(new Event('focus'));
    tooltip.dispatchEvent(new Event('mouseenter'));
    expect(controller.eventHandlers.showTooltip).toHaveBeenCalledTimes(2);
    tooltip.dispatchEvent(new Event('blur'));
    tooltip.dispatchEvent(new Event('mouseleave'));
    expect(controller.eventHandlers.hideTooltip).toHaveBeenCalledTimes(2);
  });

  describe('bindKeywordClickEvents()', () => {
    let button, inner;

    beforeEach(() => {
      controller.bindKeywordClickEvents();
      button = document.createElement('button');
      inner = document.createElement('span');
      button.appendChild(inner);
      controller.view.container.appendChild(button);
    });

    describe('highlight', () => {
      it('should highlight keyword from list', () => {
        button.classList.add('keyword-button--highlight');
        inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(controller.handleHighlightClick).toHaveBeenCalled();
        const arg = controller.handleHighlightClick.mock.calls[0][0];
        expect(arg.name).toBe('test');
      });

      it('should highlight keyword from analysis', () => {
        button.classList.add('keyword-button--highlight');
        button.dataset.keywordSource = 'result';
        inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(controller.handleHighlightClick).toHaveBeenCalled();
        const arg = controller.handleHighlightClick.mock.calls[0][0];
        expect(arg.name).toBe('analysis keyword');
      });

      it('should not call handleHighlightClick if keywordItem is null', () => {
        controller.getKeywordItem = jest.fn().mockReturnValue(null);
        button.classList.add('keyword-button--highlight');
        inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(controller.handleHighlightClick).not.toHaveBeenCalled();
      });
    });

    it('should delete keyword', () => {
      button.classList.add('keyword-button--delete');
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.deleteKeyword).toHaveBeenCalledWith('meta', 0);
    });

    it('should view details', () => {
      controller.setupTooltipListeners = jest.fn();

      button.classList.add('keyword-button--view-details');
      button.dataset.section = 'result';
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.view.renderKeywordDetails).toHaveBeenCalledTimes(1);
      const args = controller.view.renderKeywordDetails.mock.calls[0];
      expect(args[0].name).toBe('test');
      expect(typeof args[1]).toBe('function');
      args[1]();
      expect(controller.getActiveHighlightData).toHaveBeenCalled();
      expect(controller.view.toggleSection).toHaveBeenCalledWith('result');
      expect(controller.setupTooltipListeners).toHaveBeenCalledWith(controller.view.analysis);
    });

    it('should go back', () => {
      button.classList.add('keywords__section__button--back');
      button.dataset.section = 'dashboard';
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.view.toggleSection).toHaveBeenCalledWith('dashboard');
    });

    it('should change page', () => {
      button.classList.add('keywords__pagination__button');
      button.dataset.page = 2;
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.changePage).toHaveBeenCalledWith('meta', 2);
    });

    it('should not change page if page is not a number', () => {
      button.classList.add('keywords__pagination__button');
      button.dataset.page = 'invalid';
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.changePage).not.toHaveBeenCalled();
    });

    it('should sort keywords', () => {
      button.classList.add('keywords__sort-button');
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.handleKeywordSorting).toHaveBeenCalledWith('meta', button);
    });

    it('should remove filters', () => {
      button.classList.add('keywords__remove-filters');
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(controller.removeFilters).toHaveBeenCalledWith('meta');
    });
  });

  afterAll(() => {
    delete global.Keyword;
  });
});
