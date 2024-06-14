class ImgView {
  constructor(iframe) {
    this._container = this.generateImgViewSection();
    this._resultTab = new ImgViewResult(this._container);
    this._analysisTab = new ImgViewAnalysis(this._container);
    this._iframe = iframe;
    this._tabButton = undefined;
  }

  get container() {
    return this._container;
  }

  get resultTab() {
    return this._resultTab;
  }

  get analysisTab() {
    return this._analysisTab;
  }

  get iframe() {
    return this._iframe;
  }

  get currentPage() {
    return this.analysisTab.currentPage;
  }

  get tabButton() {
    return this._tabButton;
  }

  set tabButton(button) {
    this._tabButton = button;
  }

  render(imagesData, totalImg, errors, warnings) {
    this.resultTab.render(errors, warnings);
    this.analysisTab.render(imagesData, totalImg);
  }

  generateImgViewSection() {
    const asideContainer = document.querySelector('aside');
    const imgViewSection = document.createElement('section');
    imgViewSection.classList.add('w3ba11y__section', 'w3ba11y__section--img');
    imgViewSection.innerHTML = `
      <header class="section__header">
        <h2>Images Analysis</h2>
        <div class="header__tabs">
          <button data-tab="results" class="tab__button tab__button--active tab__button--results">
            <h3>Results</h3>
            <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
          </button>
          <button data-tab="analysis" class="tab__button tab__button--analysis">
            <h3>Analysis</h3>
            <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
          </button>
        </div>
      </header>
      <div class="section__body">
        <div data-tab="results" class="tab tab--active tab--results"></div>
        <div data-tab="analysis" class="tab tab--analysis"></div>
      </div>`;

    if (asideContainer.querySelector('.w3ba11y__section--img'))
      asideContainer.removeChild(asideContainer.querySelector('.w3ba11y__section--img'));
    asideContainer.appendChild(imgViewSection);

    this.tabButton = imgViewSection.querySelector('.tab__button--results');

    return asideContainer.querySelector('.w3ba11y__section--img');
  }

  removeLoading() {
    this.container.querySelectorAll('.tab__button')?.forEach(button => {
      button.querySelector('img')?.remove();
    });
  }

  changeTab(buttonClicked) {
    if (this.tabButton === buttonClicked)
      return;

    this.tabButton = buttonClicked;
    this.container.querySelector('.tab__button--active').classList.remove('tab__button--active');
    this.container.querySelector('.tab--active').classList.remove('tab--active');
    this.tabButton.classList.add('tab__button--active');
    this.container.querySelector(`.tab--${buttonClicked.dataset.tab}`).classList.add('tab--active');
  }

  changePage(imagesData, clickedButton) {
    this.analysisTab.changePage(imagesData, clickedButton);
  }

  more(hook) {
    this.analysisTab.more(hook);
  }

  show(hook) {
    const iframeWindow = this.iframe.defaultView;
    let imgTag = this.iframe.querySelector(`.${hook}`);

    if (!imgTag)
      return;
    if (imgTag.tagName === 'PICTURE')
      imgTag = imgTag.querySelector('img');

    const imgTagTop = imgTag.getBoundingClientRect().top + iframeWindow.scrollY - 100;
    iframeWindow.scrollTo({
      top: imgTagTop,
      behavior: 'smooth'
    });
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

  getNewCustomStatus(hook) {
    return this.analysisTab.getNewCustomStatus(hook);
  }
}