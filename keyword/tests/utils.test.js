const Utils = require('../utils/utils');

describe('Utils', () => {
  describe('escapeRegExp()', () => {
    it('should escape all RegExp special characters', () => {
      const input = '.+*?^${}()|[]\\';
      const expected = '\\.\\+\\*\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
      expect(Utils.escapeRegExp(input)).toBe(expected);
    });

    it('should leave normal characters untouched', () => {
      const input = 'abc 123';
      expect(Utils.escapeRegExp(input)).toBe('abc 123');
    });
  });

  describe('sanitizeInput()', () => {
    it('should remove invalid characters', () => {
      const input = 'Hello! 🌟 @world# <script>window.alert(1)</script>';
      const expected = 'Hello world scriptwindow.alert1script';
      expect(Utils.sanitizeInput(input)).toBe(expected);
    });

    it('should preserve letters, numbers, dash, dot, underscore, apostrophes', () => {
      const input = `O'Reilly_dev-site.v1.0 - test...`;
      const expected = `O'Reilly_dev-site.v1.0 test`;
      expect(Utils.sanitizeInput(input)).toBe(expected);
    });
  });
});