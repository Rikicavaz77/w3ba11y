/**
 * @jest-environment jsdom
 */
const AnalysisResultView = require('../../view/analysis_result_view');
const Keyword = require('../../model/keyword');
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('AnalysisResultView', () => {
  let view, keywordItem, mockGetActiveHighlightData;

  beforeEach(() => {
    mockGetActiveHighlightData = jest.fn().mockReturnValue({
      keyword: null,
      source: null
    });
    view = new AnalysisResultView(mockGetActiveHighlightData);
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

  describe('render()', () => {
    it('should populate analysis container with keyword data', () => {    
      keywordItem.name = '<script>alert(1)</script>';
      view.render(keywordItem);
      
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container).not.toBeNull();
      expect(container.innerHTML).not.toContain('<script>alert(1)</script>');
      expect(container.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(container.textContent).toContain('24');
      expect(container.textContent).toContain('0.84');
      const hasMatch = /\bp\b/.test(container.querySelector('.keywords__tag-occurrences-list').textContent);
      expect(hasMatch).toBe(true);
      expect(container.textContent).toContain('2');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeNull();
      expect(view.currentKeywordItem).toBe(keywordItem);
    });

    it('should handle more renderings', () => {
      view.render(keywordItem);
      const anotherkeywordItem = new Keyword('another test');
      view.render(anotherkeywordItem);
      const container = view.body.querySelectorAll('.keywords__analysis-container');
      expect(container.length).toBe(1);
    });

    it('should make highlight button active', () => {
      mockGetActiveHighlightData = jest.fn().mockReturnValue({
        keyword: keywordItem,
        source: 'result'
      });
      view._getActiveHighlightData = mockGetActiveHighlightData;
      view.render(keywordItem);
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeTruthy();
    });

    it('should not make highlight button active', () => {
      mockGetActiveHighlightData = jest.fn().mockReturnValue({
        keyword: keywordItem,
        source: 'list'
      });
      expect(view.body).toBe('ciao');
      view._getActiveHighlightData = mockGetActiveHighlightData;
      view.render(keywordItem);
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeNull();
    });
  }); 

  afterAll(() => {
    delete global.Utils;
  }); 
});
