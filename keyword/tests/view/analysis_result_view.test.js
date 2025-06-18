/**
 * @jest-environment jsdom
 */
const AnalysisResultView = require('@keyword/view/analysis_result_view');
const Keyword = require('@keyword/model/keyword');
const Utils = require('@keyword/utils/utils');
global.Utils = Utils;

describe('AnalysisResultView', () => {
  let view, keywordItem, mockGetActiveHighlightedKeyword;

  beforeEach(() => {
    mockGetActiveHighlightedKeyword = jest.fn().mockReturnValue(null);
    view = new AnalysisResultView(mockGetActiveHighlightedKeyword);
    keywordItem = new Keyword('test', {
      frequency: 24,
      density: 0.84,
      keywordOccurrences: {
        title: 1,
        description: 1,
        h1: 1,
        h2: 0,
        p: 2
      }
    });
  });

  test('should initialize container, header and body', () => {
    expect(view.container).toBeInstanceOf(HTMLElement);
    expect(view.header).toBeInstanceOf(HTMLElement);
    expect(view.body).toBeInstanceOf(HTMLElement);
  });

  test('setters should assign values correctly', () => {
    const dummy = {};

    view.container = dummy;
    view.header = dummy;
    view.body = dummy;
    view.currentKeywordItem = dummy;

    expect(view.container).toBe(dummy);
    expect(view.header).toBe(dummy);
    expect(view.body).toBe(dummy);
    expect(view.currentKeywordItem).toBe(dummy);
  });


  test('renderWarningIconIfNeeded() should handle warning icon creation', () => {
    let icon = view._renderWarningIconIfNeeded(0);
    expect(icon).toContain('keywords__icon--error');

    icon = view._renderWarningIconIfNeeded(10);
    expect(icon).toBe('');
  });

  describe('render()', () => {
    it('should populate analysis container with keyword data', () => {    
      keywordItem.name = '<script>alert(1)</script>';
      view.render(keywordItem, 'meta');
      
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container).not.toBeNull();
      const highlightButton = container.querySelector('.keyword-button--highlight');
      expect(highlightButton).toBeTruthy();
      expect(highlightButton.dataset.keywordSource).toBe('result');
      expect(highlightButton.dataset.keywordType).toBe('meta');
      expect(highlightButton.classList.contains('.keyword-button--highlight--active')).toBe(false);
      expect(container.querySelectorAll('.keywords__icon--error').length).toBe(0);
      expect(view.currentKeywordItem).toBe(keywordItem);

      expect(container.innerHTML).not.toContain('<script>alert(1)</script>');
      expect(container.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(container.textContent).toContain('<script>alert(1)</script>');
      expect(container.textContent).toContain('24');
      expect(container.querySelector('.keyword-frequency-note')).toBeTruthy();
      expect(container.textContent).toContain('0.84');
      const hasMatch = /\bp\b/.test(
        container.querySelector('.keywords__tag-occurrences-list').textContent
      );
      expect(hasMatch).toBe(true);
      expect(container.textContent).toContain('2');
    });

    it('should handle more renderings', () => {
      view.render(keywordItem, 'meta');
      
      const anotherkeywordItem = new Keyword('another test', {
        frequency: 'invalid',
        density: NaN,
        keywordOccurrences: {
          title: 0,
          description: undefined,
          h1: '9',
          h2: '0',
          p: null
        }
      });
      view.render(anotherkeywordItem, 'meta');

      const container = view.body.querySelectorAll('.keywords__analysis-container');
      expect(container.length).toBe(1);
      expect(container[0].textContent).toContain('9');
      const match = container[0].textContent.match(/0/g) || [];
      expect(match.length).toBe(6);
      expect(container[0].querySelectorAll('.keywords__icon--error').length).toBe(2);
    });

    it('should make highlight button active', () => {
      mockGetActiveHighlightedKeyword = jest.fn().mockReturnValue(keywordItem);
      view._getActiveHighlightedKeyword = mockGetActiveHighlightedKeyword;
      view.render(keywordItem, 'meta');
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeTruthy();
    });
  }); 

  afterAll(() => {
    delete global.Utils;
  }); 
});
