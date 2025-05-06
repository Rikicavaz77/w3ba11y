class HView {
  constructor(iframe) {
    this._container = this.generateHViewSection();
    this._iframe = iframe;
    this._header;
    this._body;
  }

  get container() {
    return this._container;
  }

  get iframe() {
    return this._iframe;
  }

  get header() {
    return this._header;
  }

  get body() {
    return this._body;
  }

  set header(header) {
    this._header = header;
  }

  set body(body) {
    this._body = body;
  }

  generateHViewSection() {
    const asideBody = document.querySelector('aside .w3ba11y__body');
    const hViewSection = document.createElement('section');
    hViewSection.classList.add('w3ba11y__section', 'w3ba11y__section--h');
    hViewSection.innerHTML = `
      <header class="section__header">
        <h2>Heading Analysis</h2>
        <div class="header__tabs">
          <button data-section="general" class="ri-arrow-go-back-line section__button section__button--back">
            <span class="visually-hidden">Back to general</span>
          </button>
        </div>
      </header>
      <div class="section__body">
      </div>
    `;

    if (asideBody.querySelector('.w3ba11y__section--h'))
      asideBody.removeChild(asideBody.querySelector('.w3ba11y__section--h'));
    asideBody.appendChild(hViewSection);

    this.header = hViewSection.querySelector('.section__header');
    this.body = hViewSection.querySelector('.section__body');

    return asideBody.querySelector('.w3ba11y__section--h');
  }

  render(model) {
    const generateHHTML = (heading, isLast) => {
      return `
        <li class="tag-h w3ba11y_hTag_${heading.level} hlist ${isLast ? 'tag-h--last' : ''}">
          <p>h${heading.level}</p>
          ${heading.error ? 
          `<p>
            <span class="status status--error"></span>
            <span class="visually-hidden">Error</span>
          </p>` : ''}
          <p>${heading.text}</p>
        </li>`;
    };
  
    let lastIndex = model.length - 1;
  
    const HHTML = model.map((heading, index) => {
      const isLast = index === lastIndex || model[index + 1].level !== heading.level;
      return generateHHTML(heading, isLast);
    }).join('');
  
    this.body.innerHTML = `
      <ul class="w3ba11y__list w3ba11y__list--h">
        ${HHTML}
      </ul>
    `;
  }
}