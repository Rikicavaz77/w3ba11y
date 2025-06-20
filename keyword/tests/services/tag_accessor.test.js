/**
 * @jest-environment jsdom
 */
const TagAccessor = require('@keyword/services/tag_accessor');

describe('TagAccessor', () => {
  let accessor;

  beforeEach(() => {
    document.head.innerHTML = `
      <title>Test title</title>
      <meta name="Description" content="Test description">
    `;
    document.body.innerHTML = `
      <h1>Test heading</h1>
      <h1>Another test heading</h1>
      <img src="test.jpg" alt="Image alt text">
    `;
    accessor = new TagAccessor(document);
  });

  test('setters should assign values correctly', () => {
    const dummy = {};

    accessor.doc = dummy;
    accessor.useCache = dummy;

    expect(accessor.doc).toBe(dummy);
    expect(accessor.useCache).toBe(dummy);
  });

  describe('getTag()', () => {
    it('should return single element for type=single', () => {
      const description = accessor.getTag('description');
      expect(description).toBeInstanceOf(HTMLMetaElement);
      expect(description.content).toBe('Test description');
    });

    it('should return multiple elements for type=multi', () => {
      const h1 = accessor.getTag('h1');
      expect(Array.isArray(h1)).toBe(true);
      expect(h1).toHaveLength(2);
      expect(h1[0].textContent).toBe('Test heading');
    });

    it('should cache result when useCache is true', () => {
      accessor.useCache = true;

      const firstCall = accessor.getTag('h1');
      const secondCall = accessor.getTag('h1');
  
      expect(secondCall).toBe(firstCall);
    });
  });

  test('getTagOccurrences() should return correct count', () => {
    expect(accessor.getTagOccurrences('title')).toBe(1);
    expect(accessor.getTagOccurrences('h1')).toBe(2);
    expect(accessor.getTagOccurrences('h2')).toBe(0);
  });

  test('extractText() should return correct data', () => {
    const h1 = accessor.getTag('h1')[0];
    expect(accessor.extractText('h1', h1)).toBe('test heading');

    const title = accessor.getTag('title');
    expect(accessor.extractText('title', title)).toBe('test title');

    const img = accessor.getTag('alt')[0];
    expect(accessor.extractText('alt', img)).toBe('image alt text');
  });

  test('resetCache() should clear internal cache', () => {
    accessor.useCache = true;

    const firstCall = accessor.getTag('h1');
    accessor.resetCache();
    const secondCall = accessor.getTag('h1');

    expect(accessor.useCache).toBe(true);
    expect(secondCall).not.toBe(firstCall);
  });
});
