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

  get header() {
    return document.querySelector('.w3ba11y__header');
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
          <link rel="stylesheet" href="${chrome.runtime.getURL('static/fonts/remixicon.css')}">
        </head>
        <body>
          <aside>
            <header class="w3ba11y__header">
              <img class="w3ba11y__logo" src="${chrome.runtime.getURL('static/img/logo.png')}" alt="Logo">
              <h1>w3ba11y</h1>
              <div class="w3ba11y__sidebar-actions">
                <button class="w3ba11y__close-button">
                  <span class="visually-hidden">Close the extension</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w3ba11y__close-icon" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>          
                </button>
              </div>
            </header>
            <div class="w3ba11y__body">
              <section class="w3ba11y__section w3ba11y__section--active w3ba11y__section--general">
                <h2 class="section__title">Analysis</h2>
                <div class="w3ba11y__feature-access-container">
                  <button data-section="img" data-loading="true" class="section__button section__button--img">
                    <span class="button__title">Images</span>
                    <img src="${chrome.runtime.getURL('static/img/loading.gif')}" width="15px" height="15px" alt="Loading images warnings">
                  </button>
                  <button data-section="h" data-loading="true" class="section__button section__button--h">
                    <span class="button__title">Headings</span>
                    <img src="${chrome.runtime.getURL('static/img/loading.gif')}" width="15px" height="15px" alt="Loading headings warnings">
                  </button>
                  <button data-section="keyword" data-loading="true" class="section__button section__button--keyword">
                    <span class="button__title">Keywords</span>
                    <img src="${chrome.runtime.getURL('static/img/loading.gif')}" width="15px" height="15px" alt="Loading keywords warnings">
                  </button>
                </div>
                <div class="warning-message-container">
                  <strong>**Warning:</strong>
                  <ul class="warning-message-list">
                    <li class="warning-message-list__item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="warning-message-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                      </svg>
                      The extension might not correctly identify all the dynamic inserted images.
                    </li>
                    <li class="warning-message-list__item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="warning-message-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                      </svg>
                      Keyword frequency is calculated by analyzing the entire page, including hidden elements and non-visual content. As a result, some relevant keywords may not be immediately visible after using the highlighter.
                    </li>
                  </ul> 
                </div>
              </section>
            </div>
            <footer class="w3ba11y__footer">
              <p class="footer__text">© Copyright w3ba11y ${new Date().getFullYear()}. All rights reserved</p>
            </footer>
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
