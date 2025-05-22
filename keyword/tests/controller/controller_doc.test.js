/**
 * @jest-environment jsdom
 */
const KeywordController = require('../../controller/controller');
const Keyword = require('../../model/keyword');
global.Keyword = Keyword;

describe('KeywordController', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);
  });

  describe('getLang()', () => {
    it('should return lang from document', () => {
      document.documentElement.lang = 'en-US';
      const lang = controller.getLang(document);
      expect(lang).toBe('en-US');
    });
  
    it('should return empty string if lang not set', () => {
      document.documentElement.removeAttribute('lang');
      const lang = controller.getLang(document);
      expect(lang).toBe('');
    });
  });

  describe('getMetaTagKeywordsContent()', () => {
    it('should return meta keywords content', () => {
      document.head.innerHTML = `
        <meta name="keywords" content="seo, accessibility, keyword">
      `;
      const result = controller.getMetaTagKeywordsContent(document);
      expect(result).toBe('seo, accessibility, keyword');
    });

    it('should return empty string if no meta keywords present', () => {
      document.head.innerHTML = '';
      const result = controller.getMetaTagKeywordsContent(document);
      expect(result).toBe('');
    });
  });

  describe('processMetaKeywords()', () => {
    beforeEach(() => {
      controller.keywordAnalyzer = { analyzeKeywords: jest.fn() }; 
    });  

    it('should parse, store and analyze keywords', () => {
      const input = 'seo, accessibility, keyword';
      controller.processMetaKeywords(input);
      
      expect(controller.metaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
      expect(controller.displayMetaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
      expect(controller.keywordAnalyzer.analyzeKeywords).toHaveBeenCalledWith(controller.metaKeywords);
    });
  });

  describe('processMetaKeywords()', () => {
    beforeEach(() => {
      controller.keywordAnalyzer = { analyzeKeywords: jest.fn() }; 
    });  

    it('should parse, store and analyze keywords', () => {
      const input = 'seo, accessibility, keyword';
      controller.processMetaKeywords(input);
      
      expect(controller.metaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
      expect(controller.displayMetaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
      expect(controller.keywordAnalyzer.analyzeKeywords).toHaveBeenCalledWith(controller.metaKeywords);
    });

    it('should not analyze keywords if input is empty', () => {
      const input = '';
      controller.processMetaKeywords(input);
      
      expect(controller.keywordAnalyzer.analyzeKeywords).not.toHaveBeenCalled();
    });
  });

  describe('processMostFrequentKeywords()', () => {
    beforeEach(() => {
      controller.overviewInfo = { lang: 'en-US' };
      controller.wordCounter = { findOneWordKeywords: jest.fn().mockReturnValue(['test', 'seo']) };
      controller.keywordAnalyzer = { analyzeKeywords: jest.fn() }; 
    });  

    it('should find, store and analyze keywords', () => {
      controller.processMostFrequentKeywords();
      
      expect(controller.oneWordKeywords.map(k => k.name)).toEqual(['test', 'seo']);
      expect(controller.displayOneWordKeywords.map(k => k.name)).toEqual(['test', 'seo']);
      expect(controller.keywordAnalyzer.analyzeKeywords).toHaveBeenCalledWith(controller.oneWordKeywords);
    });
  });

  afterAll(() => {
    delete global.Keyword;
  });
});
