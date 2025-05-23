const KeywordController = require('../../controller/controller');

describe('KeywordController - highlight()', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);
  });

  describe('toggleHighlight()', () => {
    beforeEach(() => {
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
  
      expect(controller.keywordHighlighter.highlightKeyword).toHaveBeenCalledWith('testKeyword');
    });

    it('should remove highlight if unchecked', () => {
      const event = { target: { checked: false } };
      controller.toggleHighlight(event);
      
      expect(controller.keywordHighlighter.highlightKeyword).not.toHaveBeenCalled();
      expect(controller.keywordHighlighter.removeHighlight).toHaveBeenCalled();
    });

    it('should do nothing if keyword is empty', () => {
      controller.view = {
        customKeywordInput: { value: '' }
      };

      const event = { target: { checked: true } };
      controller.toggleHighlight(event);
      
      expect(controller.keywordHighlighter.highlightKeyword).not.toHaveBeenCalled();
      expect(controller.keywordHighlighter.removeHighlight).not.toHaveBeenCalled();
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
        value: 'yellow'
      }
    };

    controller.updateHighlightColors(event);

    expect(controller.keywordHighlighter.updateTagColors).toHaveBeenCalledWith('p', 'bg', 'yellow');
  });
});
