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

  test('processMetaKeywords() should parse and store keywords', () => {
    const input = 'seo, accessibility, keyword';
    controller.processMetaKeywords(input);
    
    expect(controller.metaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
    expect(controller.displayMetaKeywords.map(k => k.name)).toEqual(['seo', 'accessibility', 'keyword']);
  });

  describe('processMostFrequentKeywords()', () => {
    beforeEach(() => {
      controller.overviewInfo = { lang: 'en-US' };
      controller.wordCounter = { findOneWordKeywords: jest.fn().mockReturnValue(['test', 'seo']) };
    });  

    it('should find and store keywords', () => {
      controller.processMostFrequentKeywords();
      
      expect(controller.wordCounter.findOneWordKeywords).toHaveBeenCalledWith('en-US');
      expect(controller.oneWordKeywords.map(k => k.name)).toEqual(['test', 'seo']);
      expect(controller.displayOneWordKeywords.map(k => k.name)).toEqual(['test', 'seo']);
    });
  });

  describe('getListType()', () => {
    it('should return listType from dataset', () => {
      const container = document.createElement('div');
      container.classList.add('keyword-list__container');
      container.dataset.listType = 'meta';

      const target = document.createElement('button');
      container.appendChild(target);

      const result = controller.getListType(target);
      expect(result).toBe('meta');
    });

    it('should return undefined if no container', () => {
      const target = document.createElement('div');
      expect(controller.getListType(target)).toBeUndefined();
    });
  });

  describe('getKeywordIndex()', () => {
    it('should return keywordIndex from dataset', () => {
      const container = document.createElement('div');
      container.classList.add('keyword-list-item');
      container.dataset.keywordIndex = '0';

      const target = document.createElement('button');
      container.appendChild(target);

      const result = controller.getKeywordIndex(target);
      expect(result).toBe(0);
    });

    it('should return undefined if no container', () => {
      const target = document.createElement('div');
      expect(controller.getKeywordIndex(target)).toBeUndefined();
    });
  });

  describe('getKeywordItem()', () => {
    let container, listItem, target;

    beforeEach(() => {
      container = document.createElement('div');
      container.classList.add('keyword-list__container');
      container.dataset.listType = 'meta';

      listItem = document.createElement('div');
      listItem.classList.add('keyword-list-item');
      listItem.dataset.keywordIndex = '1';
      container.appendChild(listItem);

      target = document.createElement('button');
      listItem.appendChild(target);
    });

    it('should return correct keyword from display', () => {  
      controller.displayMetaKeywords = [new Keyword('access'), new Keyword('accessibility'), new Keyword('account')];

      const spy = jest.spyOn(controller, 'getListByType');

      const result = controller.getKeywordItem(target);
      expect(spy).toHaveBeenCalledWith('meta');
      expect(result).toBeInstanceOf(Keyword);
      expect(result.name).toBe('accessibility');

      spy.mockRestore();
    });

    it('should return undefined if no listItem or container', () => {
      const target = document.createElement('div');
      expect(controller.getKeywordItem(target)).toBeUndefined();
    });

    it('should return undefined if keywordIndex is not a number', () => {
      listItem.dataset.keywordIndex = 'invalid';
      expect(controller.getKeywordItem(target)).toBeUndefined();
    });
  });

  afterAll(() => {
    delete global.Keyword;
  });
});
