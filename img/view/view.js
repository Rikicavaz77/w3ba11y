class ImgView {
  constructor(iframe) {
    this._container = this.generateImgViewSection();
    this._resultTab = new ImgViewResult(this._container);
    this._analysisTab = new ImgViewAnalysis(this._container);
    this._iframe = iframe;
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

  render(model) {
    this.resultTab.render(model);
    this.analysisTab.render(model);
  }

  generateImgViewSection() {
    const asideContainer = document.querySelector('aside');

    if (!asideContainer) {
      console.error('No aside element found in the DOM.');
      return null;
    }

    if (asideContainer.querySelector('.w3ba11y__section--img'))
      asideContainer.removeChild(asideContainer.querySelector('.w3ba11y__section--img'));

    const imgViewSection = document.createElement('section');
    imgViewSection.classList.add('w3ba11y__section', 'w3ba11y__section--img');

    imgViewSection.innerHTML = `
      <header class="section__header">
        <h2>Images Analysis</h2>
        <div class="header__tabs">
          <button data-tab="results" class="tab__button tab__button--active tab__button--results">
            <h3>Results</h3>
          </button>
          <button data-tab="analysis" class="tab__button tab__button--analysis">
            <h3>Analysis</h3>
          </button>
        </div>
      </header>
      <div class="section__body">
        <div data-tab="results" class="tab tab--active tab--results"></div>
        <div data-tab="analysis" class="tab tab--analysis"></div>
      </div>`;

    asideContainer.appendChild(imgViewSection);
    return asideContainer.querySelector('.w3ba11y__section--img');
  }

  changeTab(buttonClicked) {
    this.container.querySelectorAll('.tab__button').forEach(button => {
      button === buttonClicked ? button.classList.add('tab__button--active') : button.classList.remove('tab__button--active');
    });
    this.container.querySelectorAll('.tab').forEach(tab => {
      tab.dataset.tab === buttonClicked.dataset.tab ? tab.classList.add('tab--active') : tab.classList.remove('tab--active');
    })
  }

  more(hook) {
    this.analysisTab.more(hook);
  }

  show(hook) {
    const imgTag = this.iframe.querySelector(`.${hook}`);
    const iframeWindow = this.iframe.defaultView;

    if (!imgTag)
      return;

    const imgTagTop = imgTag.getBoundingClientRect().top + iframeWindow.scrollY - 100;
    iframeWindow.scrollTo({
      top: imgTagTop,
      behavior: 'smooth'
    });
    this.iframe.querySelectorAll('.w3ba11y--highlight').forEach(img => img.classList.remove('w3ba11y--highlight'));
    imgTag.classList.add('w3ba11y--highlight');
  }

  addCustomStatus(model, hook, totalErrors, totalWarnings, status) {
    this.analysisTab.addCustomStatus(hook, totalErrors, totalWarnings, status);
    this.resultTab.render(model);
  }

  removeCustomStatus(model, hook, totalErrors, totalWarnings, customStatus) {
    this.analysisTab.removeCustomStatus(hook, totalErrors, totalWarnings, customStatus);
    this.resultTab.render(model);
  }

  updateDefaultStatus(model, hook, totalErrors, totalWarnings, targetClass, newStatus) {
    this.analysisTab.updateDefaultStatus(hook, totalErrors, totalWarnings, targetClass, newStatus);
    this.resultTab.render(model);
  }

  updateAddNoteStatus(hook, newStatus) {
    this.analysisTab.updateAddNoteStatus(hook, newStatus);
  }

  getNewCustomStatus(hook) {
    return this.analysisTab.getNewCustomStatus(hook);
  }
}