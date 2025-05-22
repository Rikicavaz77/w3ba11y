const Utils = require('../../utils/utils');

describe('Utils', () => {
  describe('escapeRegExp()', () => {
    it('should escape all RegExp special characters', () => {
      const input = '.+*?^${}()|[]\\';
      const expected = '\\.\\+\\*\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
      expect(Utils.escapeRegExp(input)).toBe(expected);
    });

    it('should leave normal characters untouched', () => {
      const input = 'abc 123';
      expect(Utils.escapeRegExp(input)).toBe(input);
    });
  });

  describe('escapeHTML()', () => {
    it('should escape dangerous HTML characters', () => {
      const input = `<script>alert("xss")</script>`;
      const expected = `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;`;
      expect(Utils.escapeHTML(input)).toBe(expected);
    });

    it('should escape ampersands and quotes', () => {
      const input = `Looney Tunes' Tom & "Jerry"`;
      const expected = `Looney Tunes&#039; Tom &amp; &quot;Jerry&quot;`;
      expect(Utils.escapeHTML(input)).toBe(expected);
    });

    it('should not escape safe text', () => {
      const input = 'Normal text with numbers 1234';
      expect(Utils.escapeHTML(input)).toBe(input);
    });
  });
});
