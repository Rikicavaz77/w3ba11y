/**
 * @jest-environment jsdom
 */
const TreeWalkerManager = require('../../services/tree_walker_manager');

describe('TreeWalkerManager', () => {
  let manager;

  beforeAll(() => {
    document.body.innerHTML = `
      <p>Valid text</p>
      <script>Ignored script</script>
      <div>   </div>
      <style>Ignored style</style>
      <button>Ignored button 
        <svg height="40" width="200" xmlns="http://www.w3.org/2000/svg">
          <text x="5" y="30" fill="none" stroke="red" font-size="35">I love SVG!</text>
          Sorry, your browser does not support inline SVG.
        </svg>
      </button>
      <p>Another <span>text</span></p>
    `;
    manager = new TreeWalkerManager(document);
  });

  test('filters out invalid tags and empty text nodes', () => {
    const result = [];
    let node;
    while ((node = manager.nextNode())) {
      result.push(node.nodeValue.trim());
    }
    expect(result).toEqual(['Valid text', 'Another', 'text']);
  });

  test('resetWalker sets currentNode back to root', () => {
    manager.resetWalker();
    expect(manager._walker.currentNode).toBe(document.body);
  });

  test('setters should assign values correctly', () => {
    const dummy = {};

    manager.doc = dummy;
    manager.root = dummy;

    expect(manager.doc).toBe(dummy);
    expect(manager.root).toBe(dummy);
  });
});
