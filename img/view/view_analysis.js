class ImgViewAnalysis {
  constructor(container) {
    this._container = this.generateImgViewAnalysisSection(container);
    this._header;
    this._loadingIcon;
    this._body;
    this._pagination;
    this._paginationButtons;
    this._currentPageButton;
  }

  get container() {
    return this._container;
  }

  get header() {
    return this._header;
  }

  get loadingIcon() {
    return this._loadingIcon;
  }

  get body() {
    return this._body;
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

  set container(container) {
    this._container = container;
  }

  set header(header) {
    this._header = header;
  }

  set loadingIcon(icon) {
    this._loadingIcon = icon;
  }

  set body(body) {
    this._body = body;
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

  generateImgViewAnalysisSection(container) {
    const tabContainer = container.querySelector('.tab--analysis');

    tabContainer.innerHTML = `
      <header class="analysis__header">
        <h2>Analysis</h2>
        <h3>Legend</h3>
        <p>T = Tag Image, B = Background Image</p>
        <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" class="w3ba11y__loading" width="200px" height="200px" alt="Loading images analysis">
      </header>
      <div class="analysis__body"></div>
      <footer class="pagination">
      <h3>Pages</h3>
      </footer>`;

    this.header = tabContainer.querySelector('.analysis__header');
    this.loadingIcon = this.header.querySelector('.w3ba11y__loading');
    this.body = tabContainer.querySelector('.analysis__body');
    this.pagination = tabContainer.querySelector('.pagination');

    return tabContainer;
  }

  render(imagesData, totalImg, index = 0) {
    this.loadingIcon?.remove();
    this.loadingIcon = undefined;
    index = Math.ceil(totalImg / imagesData.length) < index ? 0 : index;
    this.pagination.innerHTML = Array.from({ length: Math.ceil(totalImg / imagesData.length) }, (_, i) => {
      return `<button data-index="${i}" class="pagination__button ${i === index ? 'pagination__button--active' : ''}">${i + 1}</button>`;}).join('');
    this.currentPageButton = this.pagination.querySelector('.pagination__button--active');
    this.paginationButtons = this.pagination.querySelectorAll('.pagination__button');
    this.renderImages(imagesData);
  }

  renderImages(imagesData) {
    this._body.innerHTML = '';
    imagesData.forEach(img => {
      function generateStatusHTML(status, index) {
        return `
          <li class="tag__info">
            <div>
              <h4>${status.title}</h4>
              <p>${status.message}</p>
            </div>
            <ul class="hlist">
              <li class="hlist"><button class="status status--${status.status === 'warning' ? 'warning status--current' : 'error status--current'}"></button></li>
              <li class="hlist"><button data-index="${index}" class="info__remove ri-delete-bin-line"></button></li>
            </ul>
          </li>`;
      }

      const customMessages = [...img.customErrors, ...img.customWarnings].map((status, index) => generateStatusHTML(status, index)).join('');
      const size = img.memorySize > 1024 ? `${Math.round(img.memorySize / 1024, 1)}MB` : `${img.memorySize}kB`;

      this._body.innerHTML += `
        <div class="tag ${img.hook}">
          <header class="tag__header">
            <img src="${img.src}" alt="" class="tag__img">
            <ul class="hlist tag__status">
              <li class="hlist">${img.isBackground ? "B" : "T"}</li>
              <li class="hlist"><span class="status status--warning"></span><span class="status--total-warning">${img.totalWarnings}</span></li>
              <li class="hlist"><span class="status status--error"></span><span class="status--total-error">${img.totalErrors}</span></li>
              <li>
                <button class="${img.isVisible ? "ri-eye-fill" : "ri-eye-off-fill"}"><span class="visually-hidden">${img.isVisible ? "Show image" : "Image not visible"}</span></button>
              </li>
              <li>
                <button class="ri-arrow-drop-down-line"><span class="visually-hidden">More informations</span></button>
              </li>
            </ul>
          </header>
          <div class="tag__body">
            <ul class="tag__data">
              ${img.id ? `
                <li class="tag__info">
                  <div>
                    <h4>Id</h4>
                    <p>${img.id}</p>
                  </div>
                </li>` : ''}
              <li class="tag__info">
                <div>
                  <h4>Width</h4>
                  <p>${img.width}px</p>
                </div>
              </li>
              <li class="tag__info">
                <div>
                  <h4>Height</h4>
                  <p>${img.height}px</p>
                </div>
              </li>
              <li class="tag__info">
                <div>
                  <h4>Type</h4>
                  <p>${img.isBackground ? "Background image" : "Tag image"}</p>
                </div>
              </li>
              <li class="tag__info tag__info--alt">
                <div>
                  <h4>Alt (${img.altLength} chars)</h4>
                  <p>${img.alt}</p>
                </div>
                <ul class="hlist">
                  <li class="hlist"><button data-status="correct" class="status status--correct ${img.altStatus.status === 'correct' ? 'status--current' : ''}"><span class="visually-hidden">Correct</span></button></li>
                  <li class="hlist"><button data-status="warning" class="status status--warning ${img.altStatus.status === 'warning' ? 'status--current' : ''}"><span class="visually-hidden">Warning</span></button></li>
                  <li class="hlist"><button data-status="error" class="status status--error ${img.altStatus.status === 'error' ? 'status--current' : ''}"><span class="visually-hidden">Error</span></button></li>
                </ul>
              </li>
              <li class="tag__info tag__info--size">
                <div>
                  <h4>Size</h4>
                  <p>${size}</p>
                </div>
                <ul class="hlist">
                  <li class="hlist"><button data-status="correct" class="status status--correct ${img.memorySizeStatus.status === 'correct' ? 'status--current' : ''}"><span class="visually-hidden">Correct</span></button></li>
                  <li class="hlist"><button data-status="warning" class="status status--warning ${img.memorySizeStatus.status === 'warning' ? 'status--current' : ''}"><span class="visually-hidden">Warning</span></button></li>
                  <li class="hlist"><button data-status="error" class="status status--error ${img.memorySizeStatus.status === 'error' ? 'status--current' : ''}"><span class="visually-hidden">Error</span></button></li>
                </ul>
              </li>
              ${customMessages}
            </ul>
            <form action="/" class="tag__form">
              <ul class="hlist form__status-bar">
                <li><button type="button" data-status="warning" class="status status--warning status--current centralize form__status"></button><span>Warning</span></li>
                <li><button type="button" data-status="error" class="status status--error centralize form__status"></button><span>Error</span></li>
              </ul>
              <label class="form__label" for="title--${img.id}">Title</label>
              <input class="form__input--text" type="text" name="title" id="title--${img.id}">
              <label class="form__label" for="message--${img.id}">Message</label>
              <input class="form__input--text" type="text" name="message" id="message--${img.id}">
              <button type="button" class="form__input--submit">Add note</button>
            </form> 
          </div>
        </div>`;
    });
  }

  changePage(imagesData, clickedButton) {
    this.renderImages(imagesData);
    this.currentPageButton.classList.remove('pagination__button--active');
    this.currentPageButton = clickedButton;
    this.currentPageButton.classList.add('pagination__button--active');
    this.container.scrollTop = 0;
  }

  more(hook) {
    const imgTag = this.container.querySelector(`.${hook}`);
    const imgArrow = imgTag.querySelector('.ri-arrow-drop-down-line');
    const imgBody = imgTag.querySelector('.tag__body');

    imgArrow.classList.toggle('ri-arrow-drop-down-line--rotate');
    imgBody.classList.toggle('more');
  }

  updateDefaultStatus(hook, totalErrors, totalWarnings, targetClass, newStatus) {
    const imgTag = this.container.querySelector(`.${hook}`);
    const imgTagHeader = imgTag.querySelector('.tag__header');
    const imgClassStatus = imgTag.querySelector(targetClass);

    imgTagHeader.querySelector('.status--total-warning').textContent = totalWarnings;
    imgTagHeader.querySelector('.status--total-error').textContent = totalErrors;

    imgClassStatus.querySelector('.status--current').classList.remove('status--current');
    imgClassStatus.querySelector(`.status--${newStatus}`).classList.add('status--current');
  }

  updateAddNoteStatus(hook, status) {
    const imgTag = this.container.querySelector(`.${hook}`);
    const imgForm = imgTag.querySelector('.tag__form');

    imgForm.querySelector('.status--current').classList.remove('status--current');
    imgForm.querySelector(`.status--${status}`).classList.add('status--current');
  }

  addCustomStatus(hook, totalErrors, totalWarnings, status) {
    const imgTag = this.container.querySelector(`.${hook}`);
    const imgTagHeader = imgTag.querySelector('.tag__header');
    const imgData = imgTag.querySelector('.tag__data');
    const statusIndex = imgData.querySelectorAll('.tag__info--customStatus').length;
    imgData.innerHTML += `
      <li class="tag__info tag__info--customStatus">
        <div>
          <h4>${status.title}</h4>
          <p>${status.message}</p>
        </div>
        <ul class="hlist">
          <li class="hlist"><button class="status status--${status.status === 'warning' ? 'warning status--current' : 'error status--current'}"></button></li>
          <li class="hlist"><button data-index="${statusIndex}" class="info__remove ri-delete-bin-line"></button></li>
        </ul>
      </li>`;

    imgTagHeader.querySelector('.status--total-warning').textContent = totalWarnings;
    imgTagHeader.querySelector('.status--total-error').textContent = totalErrors;
  }

  removeCustomStatus(hook, totalErrors, totalWarnings, customStatus) {
    function generateStatusHTML(status, index) {
      return `
        <li class="tag__info tag__info--customStatus">
          <div>
            <h4>${status.title}</h4>
            <p>${status.message}</p>
          </div>
          <ul class="hlist">
            <li class="hlist"><button class="status status--${status.status === 'warning' ? 'warning status--current' : 'error status--current'}"></button></li>
            <li class="hlist"><button data-index="${index}" class="info__remove ri-delete-bin-line"></button></li>
          </ul>
        </li>`;
    }

    const imgTag = this.container.querySelector(`.${hook}`);
    const imgTagHeader = imgTag.querySelector('.tag__header');
    const imgData = imgTag.querySelector('.tag__data');
    const customMessages = [...customStatus].map((status, index) => generateStatusHTML(status, index)).join('');

    imgTagHeader.querySelector('.status--total-warning').textContent = totalWarnings;
    imgTagHeader.querySelector('.status--total-error').textContent = totalErrors;
    imgData.querySelectorAll('.tag__info--customStatus').forEach(status => status.remove());
    imgData.innerHTML += customMessages;
  }

  getImgTags(hook) {
    const imgTag = this.container.querySelector(`.${hook}`);
    return {
      imgTag: imgTag,
      imgShowButton: imgTag.querySelector('.ri-eye-fill'),
      imgMoreButton: imgTag.querySelector('.ri-arrow-drop-down-line'),
      imgAltStatusButtons: imgTag.querySelector('.tag__info--alt').querySelectorAll('.status'),
      imgSizeStatusButtons: imgTag.querySelector('.tag__info--size').querySelectorAll('.status'),
      imgDeleteButtons: imgTag.querySelectorAll('.ri-delete-bin-line'),
      imgAddStatusButton: imgTag.querySelectorAll('.form__status'),
      imgAddNoteSubmitButton: imgTag.querySelector('.form__input--submit')
    }
  }

  getNewCustomStatus(hook) {
    const imgTag = this.container.querySelector(`.${hook}`);
    const imgForm = imgTag.querySelector('.tag__form');
    const status = imgForm.querySelector('.status--current').classList.contains('status--warning') ? 'warning' : 'error';
    const title = imgForm.querySelector('input[name="title"]').value;
    const message = imgForm.querySelector('input[name="message"]').value;

    imgForm.querySelector('input[name="title"]').value = '';
    imgForm.querySelector('input[name="message"]').value = '';

    return {
      status: status,
      title: title,
      message: message,
    }
  }
}