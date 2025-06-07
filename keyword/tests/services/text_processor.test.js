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
    const treeWalker = new TreeWalkerManager(document);
    processor = new TextProcessor(document, treeWalker);
  });

  describe('getTextNodes()', () => {
    it('should return valid text nodes', () => {
      const textNodes = processor.getTextNodes();
      const values = textNodes.map(n => n.nodeValue.trim());
      expect(values).toEqual([
        'Main heading', 'This is a test.', 'Another', 'test', 'Another', 'test'
      ]);
    });

    it('should cache result when useCache is true', () => {
      processor.useCache = true;

      const firstCall = processor.getTextNodes();
      const secondCall = processor.getTextNodes();
  
      expect(secondCall).toBe(firstCall);
    });
  });

  describe('getTextNodeGroups()', () => {
    it('should group text nodes by block parent', () => {
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

    it('should cache result when useCache is true', () => {
      processor.useCache = true;

      const firstCall = processor.getTextNodeGroups();
      const secondCall = processor.getTextNodeGroups();
  
      expect(secondCall).toBe(firstCall);
    });
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
      expect(processor._isValidInlineElement(node)).toBe(true);
    });

    it('should return false if node is valid but not inline', () => {
      const node = document.createElement('strong');
      node.style.display = 'block';
      document.body.appendChild(node);
      expect(processor._isValidInlineElement(node)).toBe(false);
    });

    it('should return false if node is not inline', () => {
      const node = document.createElement('div');
      document.body.appendChild(node);
      expect(processor._isValidInlineElement(node)).toBe(false);
    });

    it('should return false if node is inline but not valid', () => {
      const node = document.createElement('div');
      node.style.display = 'inline';
      document.body.appendChild(node);
      expect(processor._isValidInlineElement(node)).toBe(false);
    });

    it('should return false if node is not an element', () => {
      const node = document.createTextNode('test');
      document.body.appendChild(node);
      expect(processor._isValidInlineElement(node)).toBe(false);
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

      expect(processor._getBlockParent(textNode)).toBe(p);
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

      expect(processor._getBlockParent(textNode)).toBe(document.body);
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

  describe('getCompoundSplitPattern()', () => {
    it('should split correctly around invalid characters in context', () => {
      const pattern = processor.getCompoundSplitPattern();
      const text = `word1-test.word2'word3...another`;
      const split = text.split(pattern).filter(Boolean);
      expect(split).toEqual([
        `word1-test.word2'word3`, 
        'another'
      ]);
    });

    it('should split complex text correctly', () => {
      const pattern = processor.getCompoundSplitPattern();
      const text = `Despite the project's delay—which, to be fair, was partly expected—we proceeded. 
        However, questions remain: Why now? Who approved it? And more importantly, what are the long-term 
        implications? That said, the team—divided, exhausted, yet oddly optimistic—pressed on, adjusting
        timelines, redefining priorities, and documenting every step. In retrospect, perhaps we should’ve 
        paused; re-evaluated. But momentum (as flawed as it was) carried us forward—blindly, even stubbornly.
        Still, lessons were learned: not just procedural or    technical, but human—messy, nuanced, essential.
      `;
      const split = text
        .split(pattern)
        .map(part => part.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      expect(split).toEqual([
        `Despite the project's delay—which`, 
        'to be fair',
        'was partly expected—we proceeded',
        'However',
        'questions remain',
        'Why now',
        'Who approved it',
        'And more importantly',
        'what are the long-term implications',
        'That said',
        'the team—divided',
        'exhausted',
        'yet oddly optimistic—pressed on',
        'adjusting timelines',
        'redefining priorities',
        'and documenting every step',
        'In retrospect',
        `perhaps we should’ve paused`,
        're-evaluated',
        'But momentum',
        'as flawed as it was',
        'carried us forward—blindly',
        'even stubbornly',
        'Still',
        'lessons were learned',
        'not just procedural or technical',
        'but human—messy',
        'nuanced',
        'essential'
      ]);
    });
  });

  describe('getKeywordPattern()', () => {
    it('should match expected single-word keyword', () => {
      const pattern = processor.getKeywordPattern('test');
      const text = `Let's test this pattern: run a test-case with tester.js, then take an italian "caffè".`;
      const matches = [...text.matchAll(pattern)].map(m => m[0]);
      expect(matches).toEqual(['test']);
    });

    it('should return keyword in group with capture flag', () => {
      const pattern = processor.getKeywordPattern('italian "caffè"', { capture: true, flags: 'iu' });
      const text = `
        Let's test this pattern: run a test-case with tester.js, then take an italian  
        "caffè".
      `;
      const splittedText = text
        .split(pattern)
        .map(part => part.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      expect(splittedText).toEqual([
        'Let\'s test this pattern: run a test-case with tester.js, then take an',
        'italian "caffè"',
        '.'
      ]);
    });
  });

  test('resetCache() should clear internal cache', () => {
    processor.useCache = true;

    const firstCall = processor.getTextNodes();
    processor.resetCache();
    const secondCall = processor.getTextNodes();

    expect(processor.useCache).toBe(true);
    expect(secondCall).not.toBe(firstCall);
  });

  afterAll(() => {
    delete global.Utils;
  });
});
