class Interface {
  constructor(location) {
    this._originalDocumentHTML = document.documentElement.outerHTML;
    this._main = document.createElement('main');
    this._shadowRoot = this._main.attachShadow({ mode: 'open' });
    this._iframe = document.createElement('iframe');
    this._iframe.style.width = '100%';
    this._iframe.style.height = '100%';
    this._iframe.style.border = 'none';
    this._iframe.src = location;
    this._shadowRoot.appendChild(this._iframe);
  }

  get originalDocumentHTML() {
    return this._originalDocumentHTML;
  }

  get aside() {
    return document.querySelector('aside');
  }

  get iframe() {
    return this._iframe;
  }

  get iframeDoc() {
    return this._iframeDoc;
  }

  set iframeDoc(doc) {
    this._iframeDoc = doc;
  }

  render() {
    document.documentElement.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>${document.title}</title>
          <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet"/>
        </head>
        <body>
          <aside>
            <header class="w3ba11y__header">
              <img class="w3ba11y__logo" src="${chrome.runtime.getURL('/static/img/logo.png')}" alt="Logo">
              <h1>w3ba11y</h1>
            </header>
            <section class="w3ba11y__section w3ba11y__section--active w3ba11y__section--general">
              <h2 class="section__title">Analysis</h2>
              <p class="warning-message"> **Warning: The extension might not correctly identify all the dynamic inserted images. </p>
              <div>
                <button data-section="img" data-loading="true" class="section__button section__button--img">
                  <span class="button__title">Images</span>
                  <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
                </button>
                <button data-section="h" data-loading="true" class="section__button section__button--h">
                  <span class="button__title">Headings</span>
                  <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
                </button>
              </div>
            </section>
          </aside>
        </body>
      </html>
    `;
    document.body.appendChild(this._main);
  }

  getAllSection() {
    return document.querySelectorAll('.w3ba11y__section');
  }

  getSection(section) {
    return document.querySelector(`.w3ba11y__section--${section}`);
  }

  getAllSectionLoading() {
    const sections = [];
    document.querySelectorAll('.section__button').forEach(button => {
      if (button.dataset.loading == 'true')
        sections.push(button.dataset.section);
    });
    return sections;
  }

  removeSectionLoading(component) {
    document.querySelector(`.section__button--${component}`).dataset.loading = "false";
  }

  removeLoading() {
    document.querySelectorAll('.section__button')?.forEach(button => {
      button.querySelector('img')?.remove();
    });
  }
}
