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
      tabButtons: document.createElement('button'),
      tooltipsTrigger: document.createElement('div'),
      tooltips: document.createElement('div'),
      changeTab: jest.fn(),
      showTooltip: jest.fn(),
      hideTooltip: jest.fn(),
      hideAllTooltips: jest.fn(),
      getListViewByType: jest.fn()
    };

    controller = Object.create(KeywordController.prototype);
    controller.view = mockView;

    jest.spyOn(controller, 'toggleHighlight');

    controller.eventHandlers = {
      changeTab: jest.fn(),
      showTooltip: jest.fn(),
      hideTooltip: jest.fn(),
      clearHighlightCheckbox: jest.fn(),
      toggleHighlight: controller.toggleHighlight.bind(controller),
      analyzeKeyword: jest.fn()
    };

    controller.updateHighlightColors = jest.fn();
    //controller.getListType(jest.fn)
    controller.updateVisibleKeywords = jest.fn();
    controller.clearHighlightCheckbox = jest.fn();
    //controller.getKeywordItem = jest.fn()
    controller.keywordHighlighter = {
      highlightKeyword: jest.fn(),
      removeHighlight: jest.fn()
    };
  });

  test('bindColorPicker() should attach color input handler', () => {
    controller.bindColorPicker();
    const input = document.createElement('input');
    input.type = 'color';
    input.value = '#ffff00';
    input.dataset.highlight = 'true';
    input.dataset.tag = 'p';
    input.dataset.prop = 'bg';
    controller.view.container.appendChild(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(controller.updateHighlightColors).toHaveBeenCalledTimes(1);
    const arg = controller.updateHighlightColors.mock.calls[0][0];
    expect(arg.target.dataset.tag).toBe('p');
    expect(arg.target.dataset.prop).toBe('bg');
    expect(arg.target.value).toBe('#ffff00');
  });

  test('bindKeywordInputFocus() should attach focus handler', () => {
    controller.bindKeywordInputFocus();
    controller.view.customKeywordInput.dispatchEvent(new Event('focus'));
    expect(controller.eventHandlers.clearHighlightCheckbox).toHaveBeenCalled();
  });

  test('bindHighlightToggle() should toggle highlight', () => {
    controller.bindHighlightToggle();
    controller.view.customKeywordInput.value = '  test  ';
    controller.view.keywordHighlightCheckbox.checked = true;
    controller.view.keywordHighlightCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(controller.keywordHighlighter.highlightKeyword).toHaveBeenCalledWith('test');
    
    controller.view.keywordHighlightCheckbox.checked = false;
    controller.view.keywordHighlightCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(controller.keywordHighlighter.removeHighlight).toHaveBeenCalled();
    expect(controller.toggleHighlight).toHaveBeenCalledTimes(2);
  });
});
