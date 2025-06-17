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
        getCustomKeywordValue: jest.fn().mockReturnValue('testKeyword')
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
      controller.view.getCustomKeywordValue = jest.fn().mockReturnValue('');

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

      controller.refreshListPage = jest.fn();
      controller.clearHighlightCheckbox = jest.fn();
      controller.resetHighlightState = jest.fn();

      controller.view = {
        isHighlightButtonActive: jest.fn().mockReturnValue(false),
        setActiveHighlightButton: jest.fn(),
        clearHighlightCheckbox: jest.fn()
      };

      controller.keywordHighlighter = {
        highlightKeyword: jest.fn(),
        removeHighlight: jest.fn()
      };
    });

    it('should highlight keyword if clicked button not active', () => {
      const mockButton = {
        dataset: { 
          keywordSource: 'result',
          keywordType: 'meta' 
        }
      };

      controller.handleHighlightClick(keywordItem, mockButton);
        
      expect(controller.view.isHighlightButtonActive).toHaveBeenCalledWith(mockButton);
      expect(controller.activeHighlightedKeyword).toBe(keywordItem);
      expect(controller.view.clearHighlightCheckbox).toHaveBeenCalled();
      expect(controller.view.setActiveHighlightButton).toHaveBeenCalled();
      expect(controller.keywordHighlighter.highlightKeyword).toHaveBeenCalledWith('testKeyword');
      expect(controller.refreshListPage).toHaveBeenCalledWith('meta');

      controller.refreshListPage.mockClear();

      mockButton.dataset = {};
      controller.handleHighlightClick(keywordItem, mockButton);
      expect(controller.refreshListPage).not.toHaveBeenCalled();
    });

    it('should remove highlight if clicked button already active', () => {
      controller.view.isHighlightButtonActive = jest.fn().mockReturnValue(true);

      controller.handleHighlightClick(keywordItem, {});
        
      expect(controller.resetHighlightState).toHaveBeenCalled();
      expect(controller.keywordHighlighter.removeHighlight).toHaveBeenCalled();
    });
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
