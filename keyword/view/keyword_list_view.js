class KeywordListView {
  constructor(title, listType, pageSize = 5) {
    this._title = title;
    this._listType = listType;
    this._pageSize = pageSize;
    this._container = this.generateKeywordListViewSection();
    this._pagination;
    this._paginationButtons;
    this._currentPageButton;
    this._currentPage = 1;
  }

  get container() {
    return this._container;
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

  set container(container) {
    this._container = container;
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
    return this.currentPage === page;
  }

  generateKeywordListViewSection() {
    const keywordsListContainer = document.createElement("div");
    keywordsListContainer.classList.add("keyword-list__container");
    keywordsListContainer.dataset.listType = this._listType;
    keywordsListContainer.innerHTML = `
      <h3>${this._title}</h3>
      <div class="keywords__filters-container">
        <div class="keywords__search-container">
          <div class="keywords__input-wrapper">
            <span class="keywords__input-wrapper__prefix">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="keywords__input-wrapper__icon keywords__icon--small">
                <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
              </svg>
            </span>
            <input type="text" name="search-keyword" class="keywords__input-wrapper__field" placeholder="Search keyword...">
          </div>
        </div>
        <div class="keywords__sort-container">
          <button class="keywords__sort-button" data-sort="desc">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="keywords__icon--medium">
              <path fill-rule="evenodd" d="M2 2.75A.75.75 0 0 1 2.75 2h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 2 2.75ZM2 6.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 2 6.25Zm0 3.5A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 2 9.75ZM14.78 11.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l.97.97V6.75a.75.75 0 0 1 1.5 0v5.69l.97-.97a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="keywords__sort-button" data-sort="asc">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="keywords__icon--medium">
              <path fill-rule="evenodd" d="M2 2.75A.75.75 0 0 1 2.75 2h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 2 2.75ZM2 6.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 2 6.25Zm0 3.5A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 2 9.75ZM9.22 9.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v5.69a.75.75 0 0 1-1.5 0V8.56l-.97.97a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd" />
            </svg>
          </button>
          <select name="sort-dropdown" class="keywords__sort-dropdown">
            <option class="keywords__sort-dropdown__option" value="sort-by-name">Sort by name</option>
            <option class="keywords__sort-dropdown__option" value="sort-by-score">Sort by score</option>
          </select>
          <button class="keywords__remove-filters">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="keywords__icon--medium">
              <path d="M16.284,14.87l5.716-5.881v-3.989c0-1.654-1.346-3-3-3H4c-.179,0-.355,.025-.529,.057L1.457,.043,.043,1.457,22.543,23.957l1.414-1.414-7.673-7.673Zm-1.284,4.386v4.744l-6-4.5v-3.309L2,8.989v-2.813l13,13.079Z"/>
            </svg>
          </button>
        </div>
      </div>
      <ul class="keyword-list"></ul>
      <ol class="keywords__pagination"></ol>
    `;

    this.pagination = keywordsListContainer.querySelector('.keywords__pagination');
    return keywordsListContainer;
  }

  render(keywords, totalPages, currentPage = 1, startIndex = 0) {
    currentPage = currentPage > totalPages ? 1: currentPage;
    this.renderKeywords(keywords, startIndex);
    this.renderPages(totalPages, currentPage);
  }

  changePage(keywords, totalPages, currentPage, startIndex) {
    this.render(keywords, totalPages, currentPage,startIndex);
    this.pagination.scrollIntoView();
  }

  renderKeywords(keywords, startIndex) {
    const keywordsList = this._container.querySelector(".keyword-list");
    keywordsList.innerHTML = "";
    keywords.forEach(keywordItem => {
      let item = document.createElement("li");
      item.classList.add('keyword-list-item');
      item.dataset.keywordIndex = startIndex + keywords.indexOf(keywordItem);
      item.innerHTML = `
        <h3 class="keyword-item__title">${keywordItem.name}</h3>
        <div class="keyword-item__actions">
          <button class="keyword-item__actions__button keyword-button--highlight">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="keywords__icon--medium"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M315 315l158.4-215L444.1 70.6 229 229 315 315zm-187 5s0 0 0 0l0-71.7c0-15.3 7.2-29.6 19.5-38.6L420.6 8.4C428 2.9 437 0 446.2 0c11.4 0 22.4 4.5 30.5 12.6l54.8 54.8c8.1 8.1 12.6 19 12.6 30.5c0 9.2-2.9 18.2-8.4 25.6L334.4 396.5c-9 12.3-23.4 19.5-38.6 19.5L224 416l-25.4 25.4c-12.5 12.5-32.8 12.5-45.3 0l-50.7-50.7c-12.5-12.5-12.5-32.8 0-45.3L128 320zM7 466.3l63-63 70.6 70.6-31 31c-4.5 4.5-10.6 7-17 7L24 512c-13.3 0-24-10.7-24-24l0-4.7c0-6.4 2.5-12.5 7-17z"/></svg>
          </button>
          <button class="keyword-item__actions__button keyword-button--view-details">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="keywords__icon--medium"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
          </button>
        </div>
      `;
      keywordsList.appendChild(item);
    });
  }

  renderPages(totalPages, currentPage = 1) {
    const range = Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
    const pages = [...new Set([1, ...range, totalPages].filter(p => p >= 1 && p <= totalPages))];
    this.pagination.innerHTML = "";
    pages.forEach((page, index) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <button class="keywords__pagination__button ${page === currentPage ? 'keywords__pagination__button--active' : ''}" data-page="${page}">${page}</button>
      `;
      this.pagination.appendChild(item);
      const nextPage = pages[index + 1] ?? null;
      if (nextPage && nextPage !== page + 1) {
        const item = document.createElement("li");
        item.textContent = "...";
        this.pagination.appendChild(item);
      }
    });
    this.currentPageButton = this.pagination.querySelector('.keywords__pagination__button--active');
    this.paginationButtons = this.pagination.querySelectorAll('.pagination__button');
    this.currentPage = currentPage;
  }
}