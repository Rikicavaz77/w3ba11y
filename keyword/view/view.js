class KeywordView {
  constructor(iframe) {
    this._container = this.generateKeywordViewSection();
    this._iframe = iframe;
    this._header;
    this._body;
    this._tabButtons;
    this._activeTabButton;
    this._analyzeButton;
  }

  get container() {
    return this._container;
  }

  get overviewTabButton() {
    return this._container.querySelector('.tab__button--overview');
  }

  get settingsTabButton() {
    return this._container.querySelector('.tab__button--settings');
  }

  get colorInputs() {
    return this._container.querySelectorAll('.keywords__color-selector__input');
  }

  get tooltips() {
    return this._container.querySelectorAll('.keywords__tooltip-content');
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

  get tabButtons() {
    return this._tabButtons;
  }

  get activeTabButton() {
    return this._activeTabButton;
  }

  get analyzeButton() {
    return this._analyzeButton;
  }

  set header(header) {
    this._header = header;
  }

  set body(body) {
    this._body = body;
  }

  set tabButtons(buttons) {
    this._tabButtons = buttons;
  }

  set activeTabButton(button) {
    this._activeTabButton = button;
  }

  set analyzeButton(analyzeButton) {
    this._analyzeButton = analyzeButton;
  }

  get keywordHighlightCheckbox() {
    return this.container.querySelector("#highlight-input-keyword");
  }

  get customKeywordInput() {
    return this.container.querySelector("#custom-keyword-input");
  }

  getListViewByType(listType) {
    switch (listType) {
      case 'meta':
        return this._metaKeywordsListView;
      case 'userAdded':
        return this._userKeywordsListView;
      default:
        return null;
    }
  }

  createListView(keywordListInfo) {
    switch (keywordListInfo.type) {
      case 'meta':
        if (!this._metaKeywordsListView) {
          this._metaKeywordsListView = new KeywordListView(keywordListInfo.title, keywordListInfo.type);
        }
        return this._metaKeywordsListView;
      case 'userAdded':
          if (!this._userKeywordsListView) {
            this._userKeywordsListView = new KeywordListView(keywordListInfo.title, keywordListInfo.type);
          }
          return this._userKeywordsListView;
      default:
        return null;
    }
  }

  generateKeywordViewSection() {
    const asideBody = document.querySelector('aside .w3ba11y__body');
    if (!asideBody) {
      console.error('Error: <aside> body not found in the DOM.');
      return null;
    }
    const keywordViewSection = document.createElement('section');
    keywordViewSection.classList.add('w3ba11y__section', 'w3ba11y__section--keyword');
    keywordViewSection.innerHTML = `
      <section class="keywords__section keywords__section--active keywords__section--dashboard">
        <header class="section__header">
          <h2 class="section__title">Keywords Analysis</h2>
          <div class="header__tabs">
            <button data-section="general" class="ri-arrow-go-back-line section__button section__button--back">
              <span class="visually-hidden">Back to general</span>
            </button>
            <button data-tab="overview" class="tab__button tab__button--active tab__button--overview">
              <span class="button__title">Overview</span>
            </button>
            <button data-tab="settings" class="tab__button tab__button--settings">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w3ba11y__settings-button-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span class="button__title">Settings</span>   
            </button>
          </div>
        </header>
        <div class="section__body"></div>
      </section>
    `;

    const existingKeywordSection = asideBody.querySelector('.w3ba11y__section--keyword');
    if (existingKeywordSection)
      asideBody.removeChild(existingKeywordSection);
    asideBody.appendChild(keywordViewSection);

    this.header = keywordViewSection.querySelector('.section__header');
    this.body = keywordViewSection.querySelector('.section__body');
    this.tabButtons = keywordViewSection.querySelectorAll('.tab__button');
    this.activeTabButton = keywordViewSection.querySelector('.tab__button--overview');

    return asideBody.querySelector('.w3ba11y__section--keyword');
  }

  renderKeywordsAnalysisOverview(overviewInfo) {
    const keywordsAnalysisOverviewContainer = document.createElement("div");
    keywordsAnalysisOverviewContainer.classList.add("keywords__overview-container", "tab", "tab--active", "tab--overview");
    keywordsAnalysisOverviewContainer.dataset.tab = "overview";
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

  renderKeywordInputBox() { 
    const keywordInputContainer = document.createElement("div");
    keywordInputContainer.classList.add("keywords__input-container");
    keywordInputContainer.innerHTML = `
      <label for="custom-keyword-input"><strong>Insert keyword:</strong></label>
      <div class="keywords__analyze-box">
        <div class="keywords__input-wrapper">
          <span class="keywords__input-wrapper__prefix">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="keywords__input-wrapper__icon keywords__icon--small">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>                
          </span>
          <input type="text" id="custom-keyword-input" class="keywords__input-wrapper__field" name="keyword-input" placeholder="Insert keyword...">
        </div>
        <button type="button" class="keywords__analyze-button">Analyze</button>
      </div>
      <div class="keywords__highlight-box">
        <input type="checkbox" id="highlight-input-keyword" class="keywords__highlight-input" name="keyword-highlight">
        <label for="highlight-input-keyword">Highlight keyword</label>
      </div>
    `;

    this.analyzeButton = keywordInputContainer.querySelector('.keywords__analyze-button');
    this.body.appendChild(keywordInputContainer);
  }

  renderKeywordListContainer(keywordListInfo) {
    const keywordListView = this.createListView(keywordListInfo);
    if (!keywordListView) return;
    this.body.appendChild(keywordListView.container);
    keywordListView.render(keywordListInfo.keywords, keywordListInfo.totalPages);
  }

  renderKeywordsSettings(colorMap) {
    const keywordsSettingsContainer = document.createElement("div");
    keywordsSettingsContainer.classList.add("keywords__settings-container", "tab", "tab--settings");
    keywordsSettingsContainer.dataset.tab = "settings";
    keywordsSettingsContainer.innerHTML = `
      <h2 class="keywords__settings-title">Highlight keywords</h2>
      <div class="keywords__settings-item">
        <h3 class="keywords__settings-item__title">Customize tags color</h3>
        <div class="keywords__tooltip" tabindex="0" aria-describedby="tooltip-text">
          <div class="keywords__tooltip-content">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon keywords__icon--micro">
              <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
            </svg>
            <span id="tooltip-text" class="keywords__tooltip-text keywords--not-visible">Customize the colors used to highlight keywords based on the parent tag.</span>        
          </div>                        
        </div>
      </div>
      <ul class="keyword__tag-color-options">
      ${Object.entries(colorMap)
        .map(([key, value]) => {
          return `
            <li class="keywords__tag-color-options__item">
              <h3 class="keywords__settings-item__title">${key}</h3>
              <div class="keywords__color-selector">
                <label for="highlight-bg-${key}" class="keywords__color-selector__label">Background color</label>
                <input type="color" id="highlight-bg-${key}" class="keywords__color-selector__input" name="highlight-bg" data-highlight data-tag="${key}" data-prop="bg" value="${value.bg}">
              </div>
              <div class="keywords__color-selector">
                <label for="highlight-color-${key}" class="keywords__color-selector__label">Text Color</label>
                <input type="color" id="highlight-color-${key}" class="keywords__color-selector__input" name="highlight-color" data-highlight data-tag="${key}" data-prop="color" value="${value.color}">
              </div>
              <div class="keywords__color-selector">
                <label for="highlight-border-${key}" class="keywords__color-selector__label">Border color</label>
                <input type="color" id="highlight-border-${key}" class="keywords__color-selector__input" name="highlight-border" data-highlight data-tag="${key}" data-prop="border" value="${value.border}">
              </div>
            </li>
          `; 
        })
        .join('')}
      </ul>
    `;
    this.body.appendChild(keywordsSettingsContainer);
  }

  renderKeywordDetails(keywordItem) {
    if (!this.__analysisResultView) {
      this.__analysisResultView = new AnalysisResultView(this._container);
    }
    this.__analysisResultView.render(keywordItem);
  }

  toggleSection(section) {
    this.getAllSection().forEach(section => section.classList.remove('keywords__section--active'));
    this.getSection(section)?.classList.add('keywords__section--active');
  }

  render(overviewInfo, colorMap) {
    this.renderKeywordsAnalysisOverview(overviewInfo);
    this.renderKeywordsSettings(colorMap);
    this.renderKeywordInputBox();
  }

  toggleTooltip(event) {
    const tooltipText = event.target.closest(".keywords__tooltip")?.querySelector("span");
    if (!tooltipText) {
      return;
    }
    tooltipText.classList.toggle("keywords--visible");
    tooltipText.classList.toggle("keywords--not-visible");
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

  getAllSection() {
    return this._container.querySelectorAll('.keywords__section');
  }

  getSection(section) {
    return this._container.querySelector(`.keywords__section--${section}`);
  }
}
