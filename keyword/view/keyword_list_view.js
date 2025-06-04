class KeywordListView {
  constructor({ listType, title, initialSortDirection = null, getActiveHighlightData }) {
    this._listType = listType;
    this._title = title;
    this._sortDirection = initialSortDirection;
    this._getActiveHighlightData = getActiveHighlightData;
    this._searchKeywordField = null;
    this._currentSortButton = null;
    this._pagination = null;
    this._paginationButtons = null;
    this._currentPageButton = null;
    this._currentPage = 1;
    this._container = this.generateKeywordListViewSection();
  }

  get listType() {
    return this._listType;
  }

  get title() {
    return this._title;
  }

  get container() {
    return this._container;
  }

  get searchKeywordField() {
    return this._searchKeywordField;
  }

  get currentSortButton() {
    return this._currentSortButton;
  }

  get sortDirection() {
    return this._sortDirection;
  }

  get pagination() {
    return this._pagination;
  }

  get paginationButtons() {
    return this._paginationButtons;
  }

  get currentPageButton() {
    return this._currentPageButton;
  }

  get currentPage() {
    return this._currentPage;
  }

  set listType(listType) {
    this._listType = listType;
  }

  set title(title) {
    this._title = title;
  }

  set container(container) {
    this._container = container;
  }

  set searchKeywordField(searchKeywordField) {
    this._searchKeywordField = searchKeywordField;
  }

  set currentSortButton(newButton) {
    this._currentSortButton = newButton;
  }

  set sortDirection(sortDirection) {
    this._sortDirection = sortDirection;
  }

  set pagination(pagination) {
    this._pagination = pagination;
  }

  set paginationButtons(buttons) {
    this._paginationButtons = buttons;
  }

  set currentPageButton(newButton) {
    this._currentPageButton = newButton;
  }

  set currentPage(currentPage) {
    this._currentPage = currentPage;
  }

  isCurrentPage(page) {
    return this._currentPage === page;
  }

  getSearchQuery() {
    return this._searchKeywordField?.value.trim() || '';
  }

  generateKeywordListViewSection() {
    const keywordListContainer = document.createElement('div');
    keywordListContainer.classList.add('keyword-list__container');
    keywordListContainer.dataset.listType = this._listType;
    keywordListContainer.innerHTML = `
      <h3>${this._title}</h3>
      <div class="keywords__filters-container">
        <div class="keywords__search-container">
          <div class="keywords__input-wrapper">
            <span class="keywords__input-wrapper__prefix">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="keywords__icon--block keywords__icon--small" aria-hidden="true">
                <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
              </svg>
            </span>
            <input type="text" name="search-keyword" class="keywords__input-wrapper__field" data-search placeholder="Search keyword..." aria-label="Search keyword">
          </div>
        </div>
        <div class="keywords__sort-container">
          <button class="keywords__sort-button" data-sort="desc">
            <span class="visually-hidden">Sort descending</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="keywords__icon--middle-align keywords__icon--medium" aria-hidden="true">
              <path fill-rule="evenodd" d="M2 2.75A.75.75 0 0 1 2.75 2h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 2 2.75ZM2 6.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 2 6.25Zm0 3.5A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 2 9.75ZM14.78 11.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l.97.97V6.75a.75.75 0 0 1 1.5 0v5.69l.97-.97a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="keywords__sort-button" data-sort="asc">
            <span class="visually-hidden">Sort ascending</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="keywords__icon--middle-align keywords__icon--medium" aria-hidden="true">
              <path fill-rule="evenodd" d="M2 2.75A.75.75 0 0 1 2.75 2h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 2 2.75ZM2 6.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 2 6.25Zm0 3.5A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 2 9.75ZM9.22 9.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v5.69a.75.75 0 0 1-1.5 0V8.56l-.97.97a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="keywords__remove-filters">
            <span class="visually-hidden">Remove all filters</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="keywords__icon--medium" aria-hidden="true">
              <path d="M16.284,14.87l5.716-5.881v-3.989c0-1.654-1.346-3-3-3H4c-.179,0-.355,.025-.529,.057L1.457,.043,.043,1.457,22.543,23.957l1.414-1.414-7.673-7.673Zm-1.284,4.386v4.744l-6-4.5v-3.309L2,8.989v-2.813l13,13.079Z"/>
            </svg>
          </button>
        </div>
      </div>
      <ul class="keyword-list"></ul>
      <ol class="keywords__pagination"></ol>
    `;

    this._searchKeywordField = keywordListContainer.querySelector('.keywords__input-wrapper__field');
    this._pagination = keywordListContainer.querySelector('.keywords__pagination');
    if (this._sortDirection) {
      const button = keywordListContainer.querySelector(`.keywords__sort-button[data-sort="${this._sortDirection}"]`);
      if (button) {
        this.updateSortButtons(button);
      }
    }

    return keywordListContainer;
  }

  render(keywords, totalPages, currentPage = 1, startIndex = 0) {
    this.renderKeywords(keywords, startIndex);
    this.renderPages(totalPages, currentPage);
  }

  scrollToPagination() {
    if (this._pagination) {
      this._pagination.scrollIntoView({
        block: 'nearest'
      });
    }
  }

  updateSortButtons(clickedButton) {
    this._currentSortButton?.classList.remove('keywords__sort-button--active');
    this._currentSortButton = clickedButton;
    this._currentSortButton.classList.add('keywords__sort-button--active');
    this._sortDirection = clickedButton.dataset.sort;
  }

  removeFilters() {
    this._currentSortButton?.classList.remove('keywords__sort-button--active');
    this._currentSortButton = null;
    this._sortDirection = null;
    this._searchKeywordField.value = '';
  }

  _renderDeleteButtonIfNeeded() {
    if (this._listType !== 'userAdded') return '';
    return `
      <button class="keyword-item__actions__button keyword-button--delete">
        <span class="visually-hidden">Delete keyword</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__icon--delete keywords__icon--middle-align keywords__icon--medium" aria-hidden="true">
          <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
        </svg>
      </button>
    `;
  }

  _renderWarningIconIfNeeded(frequency) {
    if (this._listType !== 'meta' || frequency !== 0) return '';
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keyword-icon--error keywords__icon--medium keywords__icon--inline-block keywords__icon--no-shrink" aria-hidden="true">
        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
      </svg>
    `;
  }

  _getHighlightClass(keywordItem) {
    const { keyword, source } = this._getActiveHighlightData();
    const isHighlighted = (
      keyword === keywordItem &&
      source === 'list'
    );
    return isHighlighted ? 'keyword-button--highlight--active' : '';
  }

  renderKeywords(keywords, startIndex) {
    const keywordList = this._container.querySelector('.keyword-list');
    keywordList.innerHTML = '';
    keywords.forEach(keywordItem => {
      const item = document.createElement('li');
      item.classList.add('keyword-list-item');
      item.dataset.keywordIndex = startIndex + keywords.indexOf(keywordItem);

      const safeName = Utils.escapeHTML(keywordItem.name);
      const safeFrequency = keywordItem.frequency == null || isNaN(+keywordItem.frequency) ? 0 : +keywordItem.frequency;
      const highlightClass = this._getHighlightClass(keywordItem);

      item.innerHTML = `
        <h4 class="keyword-item__title keyword-name">
          ${safeName} (${safeFrequency}) ${this._renderWarningIconIfNeeded(safeFrequency)}
        </h4>
        <div class="keyword-item__actions">
          ${this._renderDeleteButtonIfNeeded()}
          <button class="keyword-item__actions__button keyword-button--highlight ${highlightClass}">
            <span class="visually-hidden">Highlight keyword</span>
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="keywords__icon--middle-align keywords__icon--medium" aria-hidden="true">
              <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
              <path d="M315 315l158.4-215L444.1 70.6 229 229 315 315zm-187 5s0 0 0 0l0-71.7c0-15.3 7.2-29.6 19.5-38.6L420.6 8.4C428 2.9 437 0 446.2 0c11.4 0 22.4 4.5 30.5 12.6l54.8 54.8c8.1 8.1 12.6 19 12.6 30.5c0 9.2-2.9 18.2-8.4 25.6L334.4 396.5c-9 12.3-23.4 19.5-38.6 19.5L224 416l-25.4 25.4c-12.5 12.5-32.8 12.5-45.3 0l-50.7-50.7c-12.5-12.5-12.5-32.8 0-45.3L128 320zM7 466.3l63-63 70.6 70.6-31 31c-4.5 4.5-10.6 7-17 7L24 512c-13.3 0-24-10.7-24-24l0-4.7c0-6.4 2.5-12.5 7-17z"/>
            </svg>
          </button>
          <button data-section="result" class="keyword-item__actions__button keyword-button--view-details">
            <span class="visually-hidden">View keyword details</span>
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="keywords__icon--middle-align keywords__icon--medium" aria-hidden="true">
              <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
              <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
            </svg>
          </button>
        </div>
      `;
      keywordList.appendChild(item);
    });
  }

  renderPages(totalPages, currentPage = 1) {
    const range = Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
    const pages = [...new Set([1, ...range, totalPages].filter(p => p >= 1 && p <= totalPages))];
    this._pagination.innerHTML = '';
    pages.forEach((page, index) => {
      const item = document.createElement('li');
      item.innerHTML = `
        <button class="keywords__pagination__button ${page === currentPage ? 'keywords__pagination__button--active' : ''}" data-page="${page}" aria-label="Go to page ${page}">${page}</button>
      `;
      this._pagination.appendChild(item);

      const nextPage = pages[index + 1] ?? null;
      if (nextPage && nextPage !== page + 1) {
        const item = document.createElement('li');
        item.textContent = '...';
        this._pagination.appendChild(item);
      }
    });
    this._currentPageButton = this._pagination.querySelector('.keywords__pagination__button--active');
    this._paginationButtons = this._pagination.querySelectorAll('.keywords__pagination__button');
    this._currentPage = currentPage;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordListView;
}
