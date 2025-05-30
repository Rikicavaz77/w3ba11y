class ImgView {
  constructor(iframe) {
    this._container = this.generateImgViewSection();
    this._resultTab = new ImgViewResult(this._container);
    this._analysisTab = new ImgViewAnalysis(this._container);
    this._iframe = iframe;
    this._tabButtons;
    this._activeTabButton;
    this._refreshButton;
  }

  get container() {
    return this._container;
  }

  get resultTab() {
    return this._resultTab;
  }

  get resultTabButton() {
    return this._container.querySelector('.tab__button--results');
  }

  get analysisTab() {
    return this._analysisTab;
  }

  get analysisTabButton() {
    return this._container.querySelector('.tab__button--analysis');
  }

  get iframe() {
    return this._iframe;
  }

  get currentPage() {
    return this.analysisTab.currentPage;
  }

  get tabButtons() {
    return this._tabButtons;
  }

  get activeTabButton() {
    return this._activeTabButton;
  }

  get refreshButton() {
    return this._refreshButton;
  }

  get paginationButtons() {
    return this.analysisTab.paginationButtons;
  }

  get activePaginationButton() {
    return this.analysisTab.currentPageButton;
  }

  get filterButtons() {
    return this.resultTab.filterButtons;
  }

  set tabButtons(buttons) {
    this._tabButtons = buttons;
  }

  set activeTabButton(button) {
    this._activeTabButton = button;
  }

  set refreshButton(button) {
    this._refreshButton = button;
  }

  set paginationButtons(buttons) {
    this._paginationButtons = buttons;
  }

  set filterButtons(buttons) {
    this.resultTab.filterButtons = buttons;
  }

  render(imagesData, totalImg, errors, warnings, index = 0) {
    this.resultTab.render(errors, warnings);
    this.analysisTab.render(imagesData, totalImg, index);

    this.paginationButtons = this.analysisTab.paginationButtons;

    this.createCustomStyles();
  }

  update(iframe) {
    this._iframe = iframe;
  }
  
  generateImgViewSection() {
    const asideBody = document.querySelector('aside .w3ba11y__body');
    const imgViewSection = document.createElement('section');
    imgViewSection.classList.add('w3ba11y__section', 'w3ba11y__section--img');
    imgViewSection.innerHTML = `
      <header class="section__header">
        <h2>Images Analysis</h2>
        <div class="header__tabs">
          <button data-section="general" class="ri-arrow-go-back-line section__button section__button--back">
            <span class="visually-hidden">Back to general</span>
          </button>
          <button data-tab="results" class="tab__button tab__button--active tab__button--results">
            <span class="button__title">Results</span>
            <img src="${chrome.runtime.getURL('static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
          </button>
          <button data-tab="analysis" class="tab__button tab__button--analysis">
            <span class="button__title">Analysis</span>
            <img src="${chrome.runtime.getURL('static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
          </button>
        </div>
      </header>
      <div class="section__body">
        <div data-tab="results" class="tab tab--active tab--results"></div>
        <div data-tab="analysis" class="tab tab--analysis"></div>
      </div>`;

    const existingImgSection = asideBody.querySelector('.w3ba11y__section--img');
    if (existingImgSection)
      asideBody.removeChild(existingImgSection);
    asideBody.appendChild(imgViewSection);

    this.tabButtons = imgViewSection.querySelectorAll('.tab__button');
    this.activeTabButton = imgViewSection.querySelector('.tab__button--results');

    this.refreshButton = imgViewSection.querySelector('.ri-restart-line');

    return asideBody.querySelector('.w3ba11y__section--img');
  }

  removeLoading() {
    this.container.querySelectorAll('.tab__button')?.forEach(button => {
      button.querySelector('img')?.remove();
    });
  }

  changeTab(buttonClicked) {
    if (this.activeTabButton === buttonClicked)
      return;

    this.activeTabButton = buttonClicked;
    this.container.querySelector('.tab__button--active').classList.remove('tab__button--active');
    this.container.querySelector('.tab--active').classList.remove('tab--active');
    this.activeTabButton.classList.add('tab__button--active');
    this.container.querySelector(`.tab--${buttonClicked.dataset.tab}`).classList.add('tab--active');
  }

  changePage(imagesData, clickedButton) {
    this.analysisTab.changePage(imagesData, clickedButton);
  }

  more(hook) {
    this.analysisTab.more(hook);
  }

  show(hook) {
    const centerImgHorizontally = (img) => {
      let element = img;
      const screenWidth = window.innerWidth;
      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.width;
      let parent = element.parentElement;

      while (parent && parent !== this.iframe.body) {
          if (parent.scrollWidth > parent.clientWidth) {
              const parentRect = parent.getBoundingClientRect();
              const elementLeftRelativeToParent = elementRect.left - parentRect.left;
              const scrollLeft = elementLeftRelativeToParent - (screenWidth / 2) + (3 * elementWidth / 4);
              parent.scrollTo({
                  left: parent.scrollLeft + scrollLeft,
                  behavior: 'smooth'
              });
          }
          element = parent;
          parent = element.parentElement;
      }
  };

    let imgTag = this.iframe.querySelector(`.${hook}`);
    const iframeWindow = this.iframe.defaultView;

    if (!imgTag) return;

    if (imgTag.tagName === 'PICTURE') {
        imgTag = imgTag.querySelector('img');
        if (!imgTag) return;
    }

    const imgTagRect = imgTag.getBoundingClientRect();
    const iframeScrollY = iframeWindow.scrollY || iframeWindow.pageYOffset;
    const imgTagTop = imgTagRect.top + iframeScrollY - 100;

    iframeWindow.scrollTo({
        top: imgTagTop,
        behavior: 'smooth'
    });

    centerImgHorizontally(imgTag);

    this.iframe.querySelectorAll('.w3ba11y--highlight').forEach(img => img.classList.remove('w3ba11y--highlight'));
    imgTag.classList.add('w3ba11y--highlight');
  }

  addCustomStatus(customErrors, customWarning, hook, totalErrors, totalWarnings, status) {
    this.analysisTab.addCustomStatus(hook, totalErrors, totalWarnings, status);
    this.resultTab.render(customErrors, customWarning);
  }

  removeCustomStatus(customErrors, customWarning, hook, totalErrors, totalWarnings, customStatus) {
    this.analysisTab.removeCustomStatus(hook, totalErrors, totalWarnings, customStatus);
    this.resultTab.render(customErrors, customWarning);
  }

  updateDefaultStatus(customErrors, customWarning, hook, totalErrors, totalWarnings, targetClass, newStatus) {
    this.analysisTab.updateDefaultStatus(hook, totalErrors, totalWarnings, targetClass, newStatus);
    this.resultTab.render(customErrors, customWarning);
  }

  updateAddNoteStatus(hook, newStatus) {
    this.analysisTab.updateAddNoteStatus(hook, newStatus);
  }

  getAllImg() {
    return this.analysisTab.getAllImg();
  }

  getImgTags(hook) {
    return this.analysisTab.getImgTags(hook);
  }

  getNewCustomStatus(hook) {
    return this.analysisTab.getNewCustomStatus(hook);
  }

  createCustomStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .w3ba11y--highlight { border: 4px solid red !important; }
    `;
    try {
      this.iframe.head.appendChild(styleElement);
    } catch (error) {}
  }
}