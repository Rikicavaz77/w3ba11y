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
              <div class="w3ba11y__sidebar-actions">
                <button id="settings-button" class="w3ba11y__settings-button" aria-label="Settings">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w3ba11y__settings-button-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                <button id="close-button" class="w3ba11y__close-button" aria-label="Close sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w3ba11y__close-button-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>          
                </button>
              </div>
            </header>
            <div class="w3ba11y__body">
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
                    <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="15px" height="15px" alt="Loading headings warnings">
                  </button>
                  <button data-section="keyword" data-loading="true" class="section__button section__button--keyword">
                    <span class="button__title">Keywords</span>
                    <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="15px" height="15px" alt="Loading keywords warnings">
                  </button>
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
