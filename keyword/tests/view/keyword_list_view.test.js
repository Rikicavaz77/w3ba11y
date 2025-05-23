/**
 * @jest-environment jsdom
 */
const KeywordListView = require('../../view/keyword_list_view');
const Keyword = require('../../model/keyword');
const Utils = require('../../utils/utils');
global.Utils = Utils;

describe('KeywordListView', () => {
  let view, keywords;

  beforeEach(() => {
    view = new KeywordListView('Meta keywords', 'meta');
    keywords = [new Keyword('test', { frequency: 26 }), new Keyword('another test', { frequency: 'invalid' })];
  });

  test('should initialize container and fields correctly', () => {
    expect(view.container).toBeInstanceOf(HTMLElement);
    expect(view.container.dataset.listType).toBe('meta');
    expect(view.searchKeywordField).toBeInstanceOf(HTMLElement);
    expect(view.pagination).toBeInstanceOf(HTMLElement);
    expect(view.currentPage).toBe(1);
    expect(view.sortDirection).toBeNull();
    expect(view.currentSortButton).toBeNull();

    view = new KeywordListView(`Most frequent 'single-word' keywords`, 'one Word', 'desc');
    expect(view.sortDirection).toBe('desc');
    const button = view.container.querySelector('.keywords__sort-button[data-sort="desc"]');
    expect(view.currentSortButton).toBe(button);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
  });

  test('setters should assign values correctly', () => {
    const dummy = {};

    view.container = dummy;
    view.searchKeywordField = dummy;
    view.pagination = dummy;
    view.paginationButtons = dummy;
    view.currentPageButton = dummy;

    expect(view.container).toBe(dummy);
    expect(view.searchKeywordField).toBe(dummy);
    expect(view.pagination).toBe(dummy);
    expect(view.paginationButtons).toBe(dummy);
    expect(view.currentPageButton).toBe(dummy);
  });

  test('isCurrentPage() should return true if current page matches', () => {    
    view.currentPage = 3;
    expect(view.isCurrentPage(3)).toBe(true);
    expect(view.isCurrentPage(2)).toBe(false);
  });

  test('render() should handle keyword and pages visualization', () => {   
    view.renderKeywords = jest.fn();
    view.renderPages = jest.fn();
    view.render(keywords, 1);
    expect(view.renderKeywords).toHaveBeenCalledWith(keywords, 0);
    expect(view.renderPages).toHaveBeenCalledWith(1, 1);
  });

  test('renderKeywords() should populate keyword list', () => {   
    view.renderKeywords(keywords, 0);
    const items = view.container.querySelectorAll('.keyword-list-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelectorAll('.keyword-button--highlight').length).toBe(1);
    expect(items[0].querySelectorAll('.keyword-button--view-details').length).toBe(1);
    expect(items[0].textContent).toContain('test (26)');
    expect(items[0].dataset.keywordIndex).toBe('0');
    expect(items[1].textContent).toContain('another test (0)');
    expect(items[1].dataset.keywordIndex).toBe('1');
  });

  test('renderPages() should generate pagination with current page active', () => {   
    view.renderPages(10, 5);
    const active = view.container.querySelector('.keywords__pagination__button--active');
    expect(active).not.toBeNull();
    expect(active.dataset.page).toBe('5');
    expect(active.textContent).toBe('5');
    expect(view.paginationButtons.length).toBe(7);
    expect(view.currentPageButton).toEqual(active);
    expect(view.currentPage).toBe(5);
    const items = [...view.pagination.querySelectorAll('li')].map(el => el.textContent.trim());
    expect(items).toContain('1');
    expect(items).not.toContain('2');
    expect(items).toContain('3');
    expect(items).toContain('4');
    expect(items).toContain('5');
    expect(items).toContain('6');
    expect(items).toContain('7');
    expect(items).not.toContain('8');
    expect(items).not.toContain('9');
    expect(items).toContain('10');
    expect(items.filter(i => i === '...').length).toBe(2);
  });

  test('scrollToPagination() should call scrollIntoView', () => {   
    view.pagination.scrollIntoView = jest.fn();
    view.scrollToPagination();
    expect(view.pagination.scrollIntoView).toHaveBeenCalled();
  });

  test('updateSortButtons() should update active sort button and direction', () => {   
    const button = view.container.querySelector('.keywords__sort-button[data-sort="desc"]');
    view.updateSortButtons(button);
    expect(view.currentSortButton).toEqual(button);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
    expect(view.sortDirection).toBe('desc');
  });

  test('removeFilters() should reset sort and search field', () => {   
    const button = view.container.querySelector('.keywords__sort-button[data-sort="desc"]');
    button.classList.add('keywords__sort-button--active');
    view.currentSortButton = button;
    view.sortDirection = button.dataset.sort;
    view.searchKeywordField.value = 'test';
    view.removeFilters(button);
    expect(view.currentSortButton).toBeNull();
    expect(button.classList.contains('keywords__sort-button--active')).toBe(false);
    expect(view.sortDirection).toBeNull();
    expect(view.searchKeywordField.value).toBe('');
  });

  afterAll(() => {
    delete global.Utils;
  }); 
});
