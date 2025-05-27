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
      relevanceScore: 85,
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
      expect(container.innerHTML).toContain('24');
      expect(container.innerHTML).toContain('0.84');
      expect(container.innerHTML).toContain('85');
      expect(container.innerHTML).toContain('<h4 class="keywords_tag-occurrences-item__title">p</h4>');
      expect(container.innerHTML).toContain('<span>2</span>');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeNull();
      expect(container.querySelectorAll('.keyword_occurrences-icon--warning').length).toBe(1);
      expect(view.currentKeywordItem).toBe(keywordItem);
    });

    it('should handle more renderings', () => {
      view.render(keywordItem);
      const anotherkeywordItem = new Keyword('another test');
      view.render(anotherkeywordItem);
      const container = view.body.querySelectorAll('.keywords__analysis-container');
      expect(container.length).toBe(1);
    });

    it('should set highlight button active', () => {
      mockGetActiveHighlightData = jest.fn().mockReturnValue({
        keyword: keywordItem,
        source: 'result'
      });
      view._getActiveHighlightData = mockGetActiveHighlightData;
      view.render(keywordItem);
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeTruthy();
    });

    it('should not set highlight button active', () => {
      mockGetActiveHighlightData = jest.fn().mockReturnValue({
        keyword: keywordItem,
        source: 'list'
      });
      view._getActiveHighlightData = mockGetActiveHighlightData;
      view.render(keywordItem);
      const container = view.body.querySelector('.keywords__analysis-container');
      expect(container.querySelector('.keyword-button--highlight--active')).toBeNull();
    });

    it('should return tooltip trigger and tooltip elements', () => {
      view.render(keywordItem);
  
      const triggers = view.tooltipsTrigger;
      const tooltip = view.tooltips;
      expect(triggers.length).toBeGreaterThan(0);
      expect(tooltip.length).toBeGreaterThan(0);
      expect(triggers[0].classList.contains('keywords__tooltip-trigger')).toBe(true);
      expect(tooltip[0].classList.contains('keywords__tooltip-text')).toBe(true);
    });
  }); 

  afterAll(() => {
    delete global.Utils;
  }); 
});
