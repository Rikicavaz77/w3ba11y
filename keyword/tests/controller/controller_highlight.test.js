const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');

describe('KeywordController - highlight()', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);
  });

  describe('toggleHighlight()', () => {
    beforeEach(() => {
      controller.resetHighlightState = jest.fn();

      controller.view = {
        customKeywordInput: { value: '    testKeyword     ' }
      };

      controller.keywordHighlighter = {
        highlightKeyword: jest.fn(),
        removeHighlight: jest.fn()
      };
    });

    it('should highlight keyword if checked', () => {
      const event = { target: { checked: true } };
      controller.toggleHighlight(event);
      
      expect(controller.resetHighlightState).toHaveBeenCalled();
      expect(controller.keywordHighlighter.highlightKeyword).toHaveBeenCalledWith('testKeyword');
    });

    it('should remove highlight if unchecked', () => {
      const event = { target: { checked: false } };
      controller.toggleHighlight(event);
      
      expect(controller.resetHighlightState).toHaveBeenCalled();
      expect(controller.keywordHighlighter.highlightKeyword).not.toHaveBeenCalled();
      expect(controller.keywordHighlighter.removeHighlight).toHaveBeenCalled();
    });

    it('should do nothing if keyword is empty', () => {
      controller.view.customKeywordInput.value = '';

      const event = { target: { checked: true } };
      controller.toggleHighlight(event);
      
      expect(controller.keywordHighlighter.highlightKeyword).not.toHaveBeenCalled();
      expect(controller.keywordHighlighter.removeHighlight).not.toHaveBeenCalled();
    });
  });

  describe('handleHighlightClick()', () => {
    let keywordItem;

    beforeEach(() => {
      keywordItem = new Keyword('testKeyword');

      controller.clearHighlightCheckbox = jest.fn();
      controller.resetHighlightState = jest.fn();

      controller.view = {
        isButtonActive: jest.fn().mockReturnValue(false),
        setActiveButton: jest.fn()
      };

      controller.keywordHighlighter = {
        highlightKeyword: jest.fn(),
        removeHighlight: jest.fn()
      };
    });

    it('should highlight keyword if clicked button not active', () => {
      const mockButton = {
        dataset: { keywordSource: 'result' }
      };

      controller.handleHighlightClick(keywordItem, mockButton);
        
      expect(controller.view.isButtonActive).toHaveBeenCalledWith(mockButton);
      expect(controller.activeHighlightedKeyword).toBe(keywordItem);
      expect(controller.activeHighlightSource).toBe('result');
      expect(controller.clearHighlightCheckbox).toHaveBeenCalled();
      expect(controller.view.setActiveButton).toHaveBeenCalled();
      expect(controller.keywordHighlighter.highlightKeyword).toHaveBeenCalledWith('testKeyword');

      mockButton.dataset = {};
      controller.handleHighlightClick(keywordItem, mockButton);
      expect(controller.activeHighlightSource).toBe('list');
    });

    it('should remove highlight if clicked button already active', () => {
      controller.view.isButtonActive = jest.fn().mockReturnValue(true);

      controller.handleHighlightClick(keywordItem, {});
        
      expect(controller.resetHighlightState).toHaveBeenCalled();
      expect(controller.keywordHighlighter.removeHighlight).toHaveBeenCalled();
    });
  });

  test('clearHighlightCheckbox() should uncheck the checkbox', () => {
    controller.view = {
      keywordHighlightCheckbox: { checked: true }
    };

    controller.clearHighlightCheckbox();

    expect(controller.view.keywordHighlightCheckbox.checked).toBe(false);
  });

  test('updateHighlightColors() should update keyword highlighter colors', () => {
    controller.keywordHighlighter = {
      updateTagColors: jest.fn()
    };

    const event = { 
      target: {
        dataset: {
          tag: 'p',
          prop: 'bg'
        },
        value: '#ffea00'
      }
    };

    controller.updateHighlightColors(event);

    expect(controller.keywordHighlighter.updateTagColors).toHaveBeenCalledWith('p', 'bg', '#ffea00');
  });
});
