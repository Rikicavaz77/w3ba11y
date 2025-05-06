class KeywordView {
  constructor(iframe) {
    this._container = this.generateKeywordViewSection();
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

  generateKeywordViewSection() {
    const asideContainer = document.querySelector('aside');
    if (!asideContainer) {
      console.error('Error: <aside> element not found in the DOM.');
      return null;
    }
    const keywordViewSection = document.createElement('section');
    keywordViewSection.classList.add('w3ba11y__section', 'w3ba11y__section--keyword');
    keywordViewSection.innerHTML = `
      <header class="section__header">
        <h2>Keywords Analysis</h2>
        <div class="header__tabs">
          <button data-section="general" class="ri-arrow-go-back-line section__button section__button--back">
            <span class="visually-hidden">Back to general</span>
          </button>
        </div>
      </header>
      <div class="section__body">
      </div>
    `;

    const existingKeywordSection = asideContainer.querySelector('.w3ba11y__section--keyword');
    if (existingKeywordSection)
      asideContainer.removeChild(existingKeywordSection);
    asideContainer.appendChild(keywordViewSection);

    this.header = keywordViewSection.querySelector('.section__header');
    this.body = keywordViewSection.querySelector('.section__body');

    return asideContainer.querySelector('.w3ba11y__section--keyword');
  }

  renderKeywordsAnalysisOverview(overviewInfo) {
    const keywordsAnalysisOverviewContainer = document.createElement("div");
    keywordsAnalysisOverviewContainer.classList.add("keywords__overview-container");
    keywordsAnalysisOverviewContainer.innerHTML = `
      <ul class="keywords__overview-list">
        <li class="keywords__overview-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="keywords__overview-item-icon keywords__icon--small">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
          <div class="keywords__overview-item-info-container">
            <div class="keywords__overview-item-header">
              <h2 class="keywords__overview-item-header__title">Keywords</h2>
              <div class="keywords__tooltip" tabindex="0" aria-describedby="tooltip-text">
                <div class="keywords__tooltip-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon keywords__icon--micro">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                  </svg>
                  <span id="tooltip-text" class="keywords__tooltip-text keywords--not-visible">Google no longer uses meta keywords as a ranking factor. However, including them can be useful for compatibility or documentation reasons.</span>
                </div>                
              </div>
            </div>
            <div id="keywords-content">
              <p class="keywords__overview-item-body__text">${overviewInfo.metaTagKeywordsContent}</p>
            </div>
          </div>
        </li>
        <li class="keywords__overview-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-item-icon keywords__icon--small">
            <path fill-rule="evenodd" d="M9 2.25a.75.75 0 0 1 .75.75v1.506a49.384 49.384 0 0 1 5.343.371.75.75 0 1 1-.186 1.489c-.66-.083-1.323-.151-1.99-.206a18.67 18.67 0 0 1-2.97 6.323c.318.384.65.753 1 1.107a.75.75 0 0 1-1.07 1.052A18.902 18.902 0 0 1 9 13.687a18.823 18.823 0 0 1-5.656 4.482.75.75 0 0 1-.688-1.333 17.323 17.323 0 0 0 5.396-4.353A18.72 18.72 0 0 1 5.89 8.598a.75.75 0 0 1 1.388-.568A17.21 17.21 0 0 0 9 11.224a17.168 17.168 0 0 0 2.391-5.165 48.04 48.04 0 0 0-8.298.307.75.75 0 0 1-.186-1.489 49.159 49.159 0 0 1 5.343-.371V3A.75.75 0 0 1 9 2.25ZM15.75 9a.75.75 0 0 1 .68.433l5.25 11.25a.75.75 0 1 1-1.36.634l-1.198-2.567h-6.744l-1.198 2.567a.75.75 0 0 1-1.36-.634l5.25-11.25A.75.75 0 0 1 15.75 9Zm-2.672 8.25h5.344l-2.672-5.726-2.672 5.726Z" clip-rule="evenodd" />
          </svg> 
          <div class="keywords__overview-item-info-container">
            <div class="keywords__overview-item-header">
              <h2 class="keywords__overview-item-header__title">Lang</h2>
              <div class="keywords__tooltip" tabindex="0" aria-describedby="tooltip-text">
                <div class="keywords__tooltip-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon keywords__icon--micro">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                  </svg>
                  <span id="tooltip-text" class="keywords__tooltip-text keywords--not-visible">The language specified in the html tag.</span>
                </div>                                
              </div>
            </div>
            <div id="lang-content">
              <p class="keywords__overview-item-body__text">${overviewInfo.lang}</p>
            </div>
          </div>          
        </li>
        <li class="keywords__overview-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-item-icon keywords__icon--small">
            <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
          </svg>
          <div class="keywords__overview-item-info-container">
            <div class="keywords__overview-item-header">
              <h2 class="keywords__overview-item-header__title">Word Count</h2>
              <div class="keywords__tooltip" tabindex="0" aria-describedby="tooltip-text">
                <div class="keywords__tooltip-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon keywords__icon--micro">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                  </svg>    
                  <span id="tooltip-text" class="keywords__tooltip-text keywords--not-visible">The total number of words in the page's Document Object Model (DOM).</span>
                </div>                            
              </div>
            </div>
            <div id="words-content">
              <p class="keywords__overview-item-body__text">${overviewInfo.wordCount}</p>
            </div>
          </div>          
        </li>
        <li class="keywords__overview-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-item-icon keywords__icon--small">
            <path fill-rule="evenodd" d="M12 3.75a6.715 6.715 0 0 0-3.722 1.118.75.75 0 1 1-.828-1.25 8.25 8.25 0 0 1 12.8 6.883c0 3.014-.574 5.897-1.62 8.543a.75.75 0 0 1-1.395-.551A21.69 21.69 0 0 0 18.75 10.5 6.75 6.75 0 0 0 12 3.75ZM6.157 5.739a.75.75 0 0 1 .21 1.04A6.715 6.715 0 0 0 5.25 10.5c0 1.613-.463 3.12-1.265 4.393a.75.75 0 0 1-1.27-.8A6.715 6.715 0 0 0 3.75 10.5c0-1.68.503-3.246 1.367-4.55a.75.75 0 0 1 1.04-.211ZM12 7.5a3 3 0 0 0-3 3c0 3.1-1.176 5.927-3.105 8.056a.75.75 0 1 1-1.112-1.008A10.459 10.459 0 0 0 7.5 10.5a4.5 4.5 0 1 1 9 0c0 .547-.022 1.09-.067 1.626a.75.75 0 0 1-1.495-.123c.041-.495.062-.996.062-1.503a3 3 0 0 0-3-3Zm0 2.25a.75.75 0 0 1 .75.75c0 3.908-1.424 7.485-3.781 10.238a.75.75 0 0 1-1.14-.975A14.19 14.19 0 0 0 11.25 10.5a.75.75 0 0 1 .75-.75Zm3.239 5.183a.75.75 0 0 1 .515.927 19.417 19.417 0 0 1-2.585 5.544.75.75 0 0 1-1.243-.84 17.915 17.915 0 0 0 2.386-5.116.75.75 0 0 1 .927-.515Z" clip-rule="evenodd" />
          </svg>
          <div class="keywords__overview-item-info-container">
            <div class="keywords__overview-item-header">
              <h2 class="keywords__overview-item-header__title">Unique Word Count</h2>
              <div class="keywords__tooltip" tabindex="0" aria-describedby="tooltip-text">
                <div class="keywords__tooltip-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon keywords__icon--micro">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                  </svg>
                  <span id="tooltip-text" class="keywords__tooltip-text keywords--not-visible">The total number of unique words in the page's Document Object Model (DOM).</span>
                </div>                           
              </div>
            </div>
            <div id="unique-words-content">
              <p class="keywords__overview-item-body__text">${overviewInfo.uniqueWordCount}</p>
            </div>
          </div>           
        </li>
      </ul>
    `;
    this.body.appendChild(keywordsAnalysisOverviewContainer);
  }

  addTooltipListeners() {
    this.body.addEventListener("mouseover", (event) => {
      if (event.target.closest(".keywords__tooltip-content")) {
        this.toggleTooltip(event);
      }
    });
    this.body.addEventListener("mouseout", (event) => {
      if (event.target.closest(".keywords__tooltip-content")) {
        this.toggleTooltip(event);
      }
    });
  }

  toggleTooltip(event) {
    const tooltipText = event.target.closest(".keywords__tooltip")?.querySelector("span");
    if (!tooltipText) {
      return; // Exit early if tooltipText is null
    }
    tooltipText.classList.toggle("keywords--visible");
    tooltipText.classList.toggle("keywords--not-visible");
  }

  render(overviewInfo) {
    this.renderKeywordsAnalysisOverview(overviewInfo);
    this.addTooltipListeners();
  }
}