/**
 * @jest-environment jsdom
 */
const TextProcessor = require('../../services/text_processor');
const TreeWalkerManager = require('../../services/tree_walker_manager');
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('TextProcessor', () => {
  let processor;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <h1>Main heading</h1>
        <p>This is a test.</p>
        <div>   </div>
        <script>Ignored script</script>
        <p>Another <strong style="display: inline;">test</strong></p>
        <p>Another<b style="display: inline;">test</b></p>
      </div> 
    `;
    const treeWalker = new TreeWalkerManager(document.body);
    processor = new TextProcessor(document, treeWalker);
  });

  test('getTextNodes() should return valid text nodes', () => {
    const textNodes = processor.getTextNodes();
    const values = textNodes.map(n => n.nodeValue.trim());
    expect(values).toEqual([
      'Main heading', 'This is a test.', 'Another', 'test', 'Another', 'test'
    ]);
  });

  test('getTextNodeGroups() should group text nodes by block parent', () => {
    const nodeGroups = processor.getTextNodeGroups();
    expect(nodeGroups.length).toBe(4);
    expect(nodeGroups[0].virtualText).toBe('Main heading');
    expect(nodeGroups[0].parent.nodeName.toLowerCase()).toBe('h1');
    expect(nodeGroups[0].nodes[0].start).toBe(0);
    expect(nodeGroups[0].nodes[0].end).toBe(12);
    expect(nodeGroups[1].virtualText).toBe('This is a test.');
    expect(nodeGroups[1].parent.nodeName.toLowerCase()).toBe('p');
    expect(nodeGroups[2].virtualText).toBe('Another test');
    expect(nodeGroups[2].parent.nodeName.toLowerCase()).toBe('p');
    expect(nodeGroups[2].nodes[0].start).toBe(0);
    expect(nodeGroups[2].nodes[0].end).toBe(8);
    expect(nodeGroups[2].nodes[1].start).toBe(8);
    expect(nodeGroups[2].nodes[1].end).toBe(12);
    expect(nodeGroups[3].virtualText).toBe('Another test');
    expect(nodeGroups[3].parent.nodeName.toLowerCase()).toBe('p');
  });

  describe('getParentName()', () => {
    it('should return allowed parent tag', () => {
      const textNodes = processor.getTextNodes();
      let parent = processor.getParentName(textNodes[0]);
      expect(parent.toLowerCase()).toBe('h1');

      parent = processor.getParentName(textNodes.at(-1));
      expect(parent.toLowerCase()).toBe('p');
    });

    it('should return root node name when no allowed parent found', () => {
      const orphan = document.createTextNode('orphan');
      document.body.appendChild(orphan);
      const parent = processor.getParentName(orphan);
      expect(parent.toLowerCase()).toBe('body');
    });
  });

  describe('isValidInlineElement()', () => {
    it('should return true if node is inline and valid', () => {
      const node = document.createElement('strong');
      node.style.display = 'inline';
      document.body.appendChild(node);
      expect(processor.isValidInlineElement(node)).toBe(true);
    });

    it('should return false if node is valid but not inline', () => {
      const node = document.createElement('strong');
      node.style.display = 'block';
      document.body.appendChild(node);
      expect(processor.isValidInlineElement(node)).toBe(false);
    });

    it('should return false if node is not inline', () => {
      const node = document.createElement('div');
      document.body.appendChild(node);
      expect(processor.isValidInlineElement(node)).toBe(false);
    });

    it('should return false if node is inline but not valid', () => {
      const node = document.createElement('div');
      node.style.display = 'inline';
      document.body.appendChild(node);
      expect(processor.isValidInlineElement(node)).toBe(false);
    });

    it('should return false if node is not an element', () => {
      const node = document.createTextNode('test');
      document.body.appendChild(node);
      expect(processor.isValidInlineElement(node)).toBe(false);
    });
  });

  describe('getBlockParent()', () => {
    it('should return the closest out-of-context ancestor', () => {
      const p = document.createElement('p');
      const span = document.createElement('span');
      span.style.display = 'inline';
      const em = document.createElement('em');
      em.style.display = 'inline';
      const textNode = document.createTextNode('test');
      em.appendChild(textNode);
      span.appendChild(em);
      p.appendChild(span);
      document.body.appendChild(p);

      expect(processor.getBlockParent(textNode)).toBe(p);
    });

    it('should return root node when no out-of-context ancestor found', () => {
      const span = document.createElement('span');
      span.style.display = 'inline';
      const em = document.createElement('em');
      em.style.display = 'inline';
      const textNode = document.createTextNode('test');
      em.appendChild(textNode);
      span.appendChild(em);
      document.body.appendChild(span);

      expect(processor.getBlockParent(textNode)).toBe(document.body);
    });
  });

  test('getWordsPattern() should match expected words', () => {
    const pattern = processor.getWordsPattern();
    const text = `Let's test this pattern: run a test-case with tester.js, then take an italian "caffè".`;
    const matches = [...text.matchAll(pattern)].map(m => m[0]);
    expect(matches).toEqual([
      'Let\'s', 'test', 'this', 'pattern', 'run', 'a', 'test-case', 'with', 
      'tester.js', 'then', 'take', 'an', 'italian', 'caffè'
    ]);
  });

  test('getCompoundSplitPattern() should split correctly around invalid characters in context', () => {
    const pattern = processor.getCompoundSplitPattern();
    const text = `word1-test.word2'word3...another`;
    const split = text.split(pattern).filter(Boolean);
    expect(split).toEqual([
      `word1-test.word2'word3`, 
      'another'
    ]);
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
