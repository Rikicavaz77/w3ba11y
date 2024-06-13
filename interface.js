class Interface {
  constructor() {
    this._originalDocumentHTML = document.documentElement.outerHTML;
    this._main = document.createElement('main');
    this._shadowRoot = this._main.attachShadow({ mode: 'open' });
    this._iframe = document.createElement('iframe');
    this._iframe.style.width = '100%';
    this._iframe.style.height = '100%';
    this._iframe.style.border = 'none';
    this._iframe.src = window.location.href;
    this._shadowRoot.appendChild(this._iframe);
  }

  get originalDocumentHTML() {
    return this._originalDocumentHTML;
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
          <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet"/>
        </head>
        <body>
          <aside>
            <header class="w3ba11y__header">
              <img src="${chrome.runtime.getURL('/static/img/logo.png')}" alt="Logo" width="100px">
              <h1>w3ba11y</h1>
            </header>
          </aside>
        </body>
      </html>
    `;
    document.body.appendChild(this._main);
  }

  createCustomStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .w3ba11y--highlight { border: 4px solid red !important; }
    `;
    try {
      this.iframeDoc.head.appendChild(styleElement);
    } catch (error) {}
  }
}
