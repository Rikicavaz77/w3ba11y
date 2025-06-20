/**
 * @jest-environment jsdom
 */
const KeywordListView = require('@keyword/view/keyword_list_view');
const Keyword = require('@keyword/model/keyword');
const Utils = require('@keyword/utils/utils');
global.Utils = Utils;

describe('KeywordListView', () => {
  let view, keywords, mockGetActiveHighlightedKeyword;

  beforeEach(() => {
    mockGetActiveHighlightedKeyword = jest.fn().mockReturnValue(null);
    view = new KeywordListView({
      title: 'Meta keywords', 
      listType: 'meta', 
      getActiveHighlightedKeyword: mockGetActiveHighlightedKeyword
    });
    keywords = [
      new Keyword('test', { frequency: 26 }), 
      new Keyword('another test', { frequency: 'invalid' })
    ];
  });

  test('should initialize container and fields correctly', () => {
    expect(view.container).toBeInstanceOf(HTMLElement);
    expect(view.title).toBe('Meta keywords');
    expect(view.listType).toBe('meta');
    expect(view.container.dataset.listType).toBe('meta');
    expect(view.searchKeywordField).toBeInstanceOf(HTMLElement);
    expect(view.filterQuery).toBe('');
    expect(view.keywordList).toBeInstanceOf(HTMLElement);
    expect(view.pagination).toBeInstanceOf(HTMLElement);
    expect(view.currentPage).toBe(1);
    expect(view.initialSortDirection).toBeNull();
    expect(view.sortDirection).toBeNull();
    expect(view.currentSortButton).toBeNull();
    expect(view._getActiveHighlightedKeyword).toBe(mockGetActiveHighlightedKeyword);

    view = new KeywordListView({
      title: `Most frequent 'single-word' keywords`, 
      listType: 'oneWord', 
      initialSortDirection: 'desc'
    });
    expect(view.initialSortDirection).toBe('desc');
    expect(view.sortDirection).toBe('desc');
    const button = view.container.querySelector('.keywords__sort-button[data-sort="desc"]');
    expect(view.currentSortButton).toBe(button);
    expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
  });

  test('setters should assign values correctly', () => {
    const dummy = {};

    view.container = dummy;
    view.searchKeywordField = dummy;
    view.filterQuery = '  test  ';
    view.keywordList = dummy;
    view.pagination = dummy;
    view.paginationButtons = dummy;
    view.currentPageButton = dummy;
    view.currentPage = 1;

    expect(view.container).toBe(dummy);
    expect(view.searchKeywordField).toBe(dummy);
    expect(view.filterQuery).toBe('test');
    expect(view.keywordList).toBe(dummy);
    expect(view.pagination).toBe(dummy);
    expect(view.paginationButtons).toBe(dummy);
    expect(view.currentPageButton).toBe(dummy);
    expect(view.currentPage).toBe(1);
  });

  test('render() should handle keyword and pages visualization', () => {   
    view.renderKeywords = jest.fn();
    view.renderPages = jest.fn();
    view.render(keywords, 1);
    expect(view.renderKeywords).toHaveBeenCalledWith(keywords, 0);
    expect(view.renderPages).toHaveBeenCalledWith(1, 1);
  });

  test('renderDeleteButtonIfNeeded() should handle delete button creation', () => {
    let button = view._renderDeleteButtonIfNeeded();
    expect(button).toBe('');

    view.title = 'User added keywords'; 
    view.listType = 'userAdded';
    button = view._renderDeleteButtonIfNeeded();
    expect(button).toContain('Delete keyword');
    const container = document.createElement('div');
    container.innerHTML = button;
    expect(container.querySelector('.keyword-button--delete')).toBeTruthy();
    expect(container.querySelector('.keywords__icon--delete')).toBeTruthy();
  });

  test('renderWarningIconIfNeeded() should handle warning icon creation', () => {
    let icon = view._renderWarningIconIfNeeded(0);
    expect(icon).toContain('keywords__icon--error');

    icon = view._renderWarningIconIfNeeded(10);
    expect(icon).toBe('');

    view.listType = 'userAdded';
    icon = view._renderWarningIconIfNeeded(0);
    expect(icon).toBe('');
  });

  describe('renderKeywords()', () => {
    it('should populate keyword list correctly', () => {
      view.renderKeywords(keywords, 0);
      const items = view.container.querySelectorAll('.keyword-list__item');
      expect(items.length).toBe(2);
      expect(items[0].querySelector('.keyword-button--delete')).toBeNull();
      expect(items[0].querySelector('.keyword-button--highlight')).toBeTruthy();
      expect(items[0].querySelector('.keyword-button--highlight--active')).toBeNull();
      expect(items[0].querySelector('.keyword-button--view-details')).toBeTruthy();
      expect(items[0].textContent).toContain('test (26)');
      expect(items[0].querySelector('.keywords__icon--error')).toBeNull();
      expect(items[0].dataset.keywordIndex).toBe('0');
      expect(items[1].textContent).toContain('another test (0)');
      expect(items[1].querySelector('.keywords__icon--error')).toBeTruthy();
      expect(items[1].dataset.keywordIndex).toBe('1');
    });

    it('should populate user-added keyword list correctly', () => {
      view.title = 'User added keywords'; 
      view.listType = 'userAdded';
      view._getActiveHighlightedKeyword = mockGetActiveHighlightedKeyword;
      view.renderKeywords(keywords, 0);
      const items = view.container.querySelectorAll('.keyword-list__item');
      expect(items[0].querySelector('.keyword-button--delete')).toBeTruthy();
      expect(items[0].querySelector('.keyword-button--highlight--active')).toBeNull();
    });

    it('should populate keyword list correctly with highlight button active', () => {
      mockGetActiveHighlightedKeyword = jest.fn().mockReturnValue(keywords[0]);
      view._getActiveHighlightedKeyword = mockGetActiveHighlightedKeyword;
      view.renderKeywords(keywords, 0);
      const items = view.container.querySelectorAll('.keyword-list__item');
      expect(items[0].querySelector('.keyword-button--highlight--active')).toBeTruthy();
    });
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

  test('isCurrentPageButton() should return true if button matches', () => {    
    const button = document.createElement('button');
    view.currentPageButton = button;
    expect(view.isCurrentPageButton(button)).toBe(true);
    expect(view.isCurrentPageButton({})).toBe(false);
  });

  test('isCurrentSortButton() should return true if button matches', () => {    
    const button = document.createElement('button');
    view.currentSortButton = button;
    expect(view.isCurrentSortButton(button)).toBe(true);
    expect(view.isCurrentSortButton({})).toBe(false);
  });

  describe('setCurrentSortButton()', () => {
    let button;

    beforeEach(() => {
      button = view.container.querySelector('.keywords__sort-button[data-sort="desc"]');
    });

    it('should update active sort button and direction', () => {   
      expect(view.currentSortButton).toEqual(null);
      expect(view.sortDirection).toBe(null);
      view.setCurrentSortButton(button);
      expect(view.currentSortButton).toEqual(button);
      expect(button.classList.contains('keywords__sort-button--active')).toBe(true);
      expect(view.sortDirection).toBe('desc');
    });

    it('should handle button already active', () => {   
      view.currentSortButton = button;
      view.setCurrentSortButton(button);
      expect(view.currentSortButton).toEqual(button);
    });
  });

  test('clearCurrentSortButton() should clear active button', () => {
    const button = document.createElement('button');
    button.classList.add('keywords__sort-button--active');
    view.currentSortButton = button;
    view.sortDirection = button.dataset.sort;
    view.clearCurrentSortButton(button);
    expect(view.currentSortButton).toBeNull();
    expect(button.classList.contains('keywords__sort-button--active')).toBe(false);
    expect(view.sortDirection).toBeNull();
  });

  test('clearSearchKeywordField() should clear the input', () => {
    view.searchKeywordField.value = 'test';
    view.filterQuery = 'test';

    view.clearSearchKeywordField();

    expect(view.searchKeywordField.value).toBe('');
    expect(view.filterQuery).toBe('');
  });

  describe('areFiltersActive()', () => {
    beforeEach(() => {
      view.initialSortDirection = null;
      view.sortDirection = 'desc';
      view.filterQuery = '';
    });

    it('should return true if all filters active', () => {
      view.filterQuery = '   test   ';
      expect(view.areFiltersActive()).toBe(true);
    });

    it('should return true if some filters active', () => {
      expect(view.areFiltersActive()).toBe(true);
    });

    it('should return true if all filters not active', () => {
      view.initialSortDirection = 'desc';
      view.sortDirection = 'desc';
      expect(view.areFiltersActive()).toBe(false);
    });
  });

  describe('removeFilters()', () => {
    let descButton;

    beforeEach(() => {
      descButton = view.container.querySelector('.keywords__sort-button[data-sort="desc"]');
      view.searchKeywordField.value = 'test';
      view.filterQuery = 'test';
    });

    test('should reset sorting and filtering with no initial sort direction', () => {   
      descButton.classList.add('keywords__sort-button--active');
      view.currentSortButton = descButton;
      view.sortDirection = descButton.dataset.sort;
      view.removeFilters(descButton);
      expect(view.currentSortButton).toBeNull();
      expect(descButton.classList.contains('keywords__sort-button--active')).toBe(false);
      expect(view.sortDirection).toBeNull();
      expect(view.searchKeywordField.value).toBe('');
      expect(view.filterQuery).toBe('');
    });

    test('should reset sorting and filtering with initial sort direction', () => {  
      view.initialSortDirection = 'desc'; 
      const button = view.container.querySelector('.keywords__sort-button[data-sort="asc"]');
      button.classList.add('keywords__sort-button--active');
      view.currentSortButton = button;
      view.sortDirection = button.dataset.sort;
      view.removeFilters(button);
      expect(view.currentSortButton).toBe(descButton);
      expect(descButton.classList.contains('keywords__sort-button--active')).toBe(true);
      expect(button.classList.contains('keywords__sort-button--active')).toBe(false);
      expect(view.sortDirection).toBe('desc');
      expect(view.searchKeywordField.value).toBe('');
      expect(view.filterQuery).toBe('');
    });
  }); 

  afterAll(() => {
    delete global.Utils;
  }); 
});
