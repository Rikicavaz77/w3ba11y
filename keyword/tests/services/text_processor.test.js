/**
 * @jest-environment jsdom
 */
const TextProcessor = require('../../services/text_processor');
const TreeWalkerManager = require('../../services/tree_walker_manager');
const Utils = require('../../utils/utils');

global.Utils = {
  escapeRegExp: Utils.escapeRegExp
};

describe('TextProcessor', () => {
  let treeWalker, processor;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <h1>Main heading</h1>
        <p>This is a test.</p>
        <div>   </div>
        <script>Ignored script</script>
        <p>Another <strong>test</strong></p>
      </div> 
    `;
    treeWalker = new TreeWalkerManager(document.body);
    processor = new TextProcessor(document, treeWalker);
  });

  test('getTextNodes() should return valid text nodes', () => {
    const textNodes = processor.getTextNodes();
    const values = textNodes.map(n => n.nodeValue.trim());
    expect(values).toEqual(['Main heading', 'This is a test.', 'Another', 'test']);
  });

  describe('getParentName()', () => {
    it('should return allowed parent tag', () => {
      const textNodes = processor.getTextNodes();
      const parent = processor.getParentName(textNodes[0]);
      expect(parent.toLowerCase()).toBe('h1');
    });

    it('should return root node name when no allowed parent found', () => {
      const orphan = document.createTextNode('orphan');
      document.body.appendChild(orphan);
      const parent = processor.getParentName(orphan);
      expect(parent.toLowerCase()).toBe('body');
    });
  });

  test('getWordsPattern() should match expected words', () => {
    const pattern = processor.getWordsPattern();
    const text = `Let's test this pattern: run a test-case with tester.js, then take an italian "caffè".`;
    const matches = [...text.matchAll(pattern)].map(m => m[0]);
    expect(matches).toEqual([
      'Let\'s', 'test', 'this', 'pattern', 'run', 'a', 'test-case', 'with', 
      'tester.js', 'then', 'take', 'an', 'italian', 'caffè']);
  });

  describe('getKeywordPattern()', () => {
    it('should match expected keywords', () => {
      const pattern = processor.getKeywordPattern('test');
      const text = `Let's test this pattern: run a test-case with tester.js, then take an italian "caffè".`;
      const matches = [...text.matchAll(pattern)].map(m => m[0]);
      expect(matches).toEqual(['test']);
    });

    it('should return keyword in group with capture flag', () => {
      const pattern = processor.getKeywordPattern('italian "caffè"', { capture: true, flags: 'iu' });
      const text = `Let's test this pattern: run a test-case with tester.js, then take an italian "caffè".`;
      const splittedText = text.split(pattern);
      expect(splittedText).toEqual([
        'Let\'s test this pattern: run a test-case with tester.js, then take an ',
        'italian "caffè"',
        '.'
      ]);
    });
  });

  afterAll(() => {
    delete global.Utils;
  });
});
