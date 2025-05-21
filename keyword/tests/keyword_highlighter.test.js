/**
 * @jest-environment jsdom
 */
const KeywordHighlighter = require('../services/keyword_highlighter');
const TextProcessor = require('../services/text_processor');
const TreeWalkerManager = require('../services/tree_walker_manager');

const Utils = require('../utils/utils');

global.Utils = {
  escapeRegExp: Utils.escapeRegExp
};

describe('KeywordHighlighter', () => {
  let highlighter;

  beforeEach(() => {
    document.body.innerHTML = `
      <p>This is a test keyword.</p>
      <script>document.getElementById("keyword");</script>
      <p>Another keyword appears here.</p>
    `;
    doc = document;
    const treeWalker = new TreeWalkerManager(doc.body);
    const textProcessor = new TextProcessor(doc, treeWalker);
    highlighter = new KeywordHighlighter(textProcessor);
  });

  test('highlightKeyword() should wrap matched text in span', () => {
    highlighter.highlightKeyword('keyword');
    const highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
    expect(highlights.length).toBe(2);
    expect(highlights[0].textContent.toLowerCase()).toBe('keyword');
    expect(highlights[0].dataset.parent).toBe('p');
  });

  test('removeHighlight() should restore plain text', () => {
    highlighter.highlightKeyword('keyword');
    highlighter.removeHighlight();
    const highlights = document.querySelectorAll('.w3ba11y__highlight-keyword');
    expect(highlights.length).toBe(0);
  });

  test('updateTagColors() should update colorMap and reinject style', () => {
    const original = highlighter.colorMap.p.bg;
    highlighter.updateTagColors('p', 'bg', 'yellow');
    expect(highlighter.colorMap.p.bg).toBe('yellow');

    const style = document.getElementById('w3ba11y-highlight-keyword-style-override');
    const tagStyle = style.textContent
      .split('.w3ba11y__highlight-keyword[')
      .filter(tag => tag.includes('data-parent=\"p\"'))
      .join('');

    expect(tagStyle).toContain('--highlight-bg-color: yellow');
    expect(tagStyle).not.toContain(`--highlight-bg-color: ${original}`);
  });

  afterAll(() => {
    delete global.Utils;
  });
});
