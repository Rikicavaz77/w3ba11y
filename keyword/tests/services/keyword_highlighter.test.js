/**
 * @jest-environment jsdom
 */
const KeywordHighlighter = require('../../services/keyword_highlighter');
const TreeWalkerManager = require('../../services/tree_walker_manager');
const TextProcessor = require('../../services/text_processor');
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('KeywordHighlighter', () => {
  let highlighter;

  beforeEach(() => {
    document.body.innerHTML = `
      <p>This is a test keyword.</p>
      <script>document.getElementById("keyword");</script>
      <p>Another keyword appears here.</p>
      <p>Compound keyword appears in the same tag</p>
      <p><strong style="display: inline;">Compound <em style="display: inline;">keyword</em></strong> appears in two different tags</p>
    `;
    const treeWalker = new TreeWalkerManager(document.body);
    const textProcessor = new TextProcessor(document, treeWalker);
    highlighter = new KeywordHighlighter(textProcessor);
  });

  describe('highlightKeyword()', () => {
    it('should highlight simple keyword', () => {
      highlighter.highlightKeyword('keyword');
      const highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBe(4);
      expect(highlights[0].textContent.toLowerCase()).toBe('keyword');
      expect(highlights[0].dataset.parent).toBe('p');
    });

    it('should highlight compound keyword in the same tag', () => {
      highlighter.highlightKeyword('test keyword');
      let highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBe(1);
      expect(highlights[0].textContent.toLowerCase()).toBe('test keyword');
      expect(highlights[0].dataset.parent).toBe('p');

      highlighter.highlightKeyword('same tag');
      highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBe(1);
      expect(highlights[0].textContent.toLowerCase()).toBe('same tag');
      expect(highlights[0].dataset.parent).toBe('p');

      highlighter.highlightKeyword('different tags');
      highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBe(1);
      expect(highlights[0].textContent.toLowerCase()).toBe('different tags');
      expect(highlights[0].dataset.parent).toBe('p');
    });

    it('should highlight compound keyword in different tags', () => {
      highlighter.highlightKeyword('compound keyword');
      let highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBe(3);
      expect(highlights[0].textContent.toLowerCase()).toBe('compound keyword');
      expect(highlights[0].dataset.parent).toBe('p');
      expect(highlights[1].textContent.toLowerCase()).toBe('compound ');
      expect(highlights[1].dataset.parent).toBe('strong');
      expect(highlights[2].textContent.toLowerCase()).toBe('keyword');
      expect(highlights[2].dataset.parent).toBe('em');
    });
  });

  describe('removeHighlight()', () => {
    it('should restore plain text', () => {
      highlighter.highlightKeyword('keyword');
      let highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBeGreaterThan(0);

      highlighter.removeHighlight();
      highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
      expect(highlights.length).toBe(0);
    });

    it('should avoid dom breaking', () => {
      let textNodes = highlighter._textProcessor.getTextNodes();
      let initialLength = textNodes.length;

      highlighter.highlightKeyword('keyword');
      highlighter.removeHighlight();

      textNodes = highlighter._textProcessor.getTextNodes();
      let currentLength = textNodes.length;
      expect(currentLength).toBe(initialLength);
    });
  });

  test('updateTagColors() should update colorMap and reinject style', () => {
    const original = highlighter.colorMap.p.bg;
    highlighter.updateTagColors('p', 'bg', '#ffea00');
    expect(highlighter.colorMap.p.bg).toBe('#ffea00');

    const style = document.getElementById('w3ba11y-highlight-keyword-style-override');
    const tagStyle = style.textContent
      .split('.w3ba11y__highlight-keyword[')
      .filter(tag => tag.includes('data-parent=\"p\"'))
      .join('');

    expect(tagStyle).toContain('--highlight-bg-color: #ffea00');
    expect(tagStyle).not.toContain(`--highlight-bg-color: ${original}`);
  });

  afterAll(() => {
    delete global.Utils;
  });
});
