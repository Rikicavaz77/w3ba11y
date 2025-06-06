class KeywordView {
  constructor(iframe) {
    this._iframe = iframe;
    this._header = null;
    this._body = null;
    this._refreshButton = null;
    this._tabButtons = null;
    this._activeTabButton = null;
    this._overviewTab = null;
    this._settingsTab = null;
    this._colorInputs = null;
    this._customKeywordInput = null;
    this._keywordHighlightCheckbox = null;
    this._analyzeButton = null;
    this._keywordListViews = {};
    this._analysisResultView = null;
    this._container = this.generateKeywordViewSection();
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

  get refreshButton() {
    return this._refreshButton;
  }

  get tabButtons() {
    return this._tabButtons;
  }

  get activeTabButton() {
    return this._activeTabButton;
  }

  get dashboardSection() {
    return this._container.querySelector('.keywords__section--dashboard');
  }

  get overviewTab() {
    return this._overviewTab;
  }

  get overviewTabButton() {
    return this._container.querySelector('.tab__button--overview');
  }

  get settingsTab() {
    return this._settingsTab;
  }

  get settingsTabButton() {
    return this._container.querySelector('.tab__button--settings');
  }

  get tooltipTriggers() {
    return this._container.querySelectorAll('.keywords__tooltip-trigger');
  }

  get tooltips() {
    return this._container.querySelectorAll('.keywords__tooltip-text');
  }

  get colorInputs() {
    return this._colorInputs;
  }

  get customKeywordInput() {
    return this._customKeywordInput;
  }

  get keywordHighlightCheckbox() {
    return this._keywordHighlightCheckbox;
  }

  get analyzeButton() {
    return this._analyzeButton;
  }

  get activeHighlightButton() {
    return this._container.querySelector('.keyword-button--highlight--active');
  }

  get analysis() {
    return this._analysisResultView;
  }

  set iframe(iframe) {
    this._iframe = iframe;
  }

  set header(header) {
    this._header = header;
  }

  set body(body) {
    this._body = body;
  }

  set refreshButton(button) {
    this._refreshButton = button;
  }

  set tabButtons(buttons) {
    this._tabButtons = buttons;
  }

  set activeTabButton(button) {
    this._activeTabButton = button;
  }

  set colorInputs(colorInputs) {
    this._colorInputs = colorInputs;
  }

  set customKeywordInput(customKeywordInput) {
    this._customKeywordInput = customKeywordInput;
  }

  set keywordHighlightCheckbox(keywordHighlightCheckbox) {
    this._keywordHighlightCheckbox = keywordHighlightCheckbox;
  }

  set analyzeButton(analyzeButton) {
    this._analyzeButton = analyzeButton;
  }

  getCustomKeywordValue() {
    return this._customKeywordInput?.value.trim() || '';
  }

  _performListViewCreation({ type, title, sortDirection }, getActive) {
    return new KeywordListView({
      listType: type,
      title,
      initialSortDirection: sortDirection,
      getActiveHighlightData: getActive
    });
  }

  createListView(keywordListInfo, getActiveHighlightData) {
    const type = keywordListInfo.type;

    if (!this._keywordListViews[type]) {
      this._keywordListViews[type] = this._performListViewCreation(keywordListInfo, getActiveHighlightData);
    }

    return this._keywordListViews[type];
  }

  getListViewByType(type) {
    return this._keywordListViews[type] ?? null;
  }

  removeKeywordList(type) {
    const listView = this.getListViewByType(type);
    if (listView && listView.container) {
      listView.container.remove();
      this._keywordListViews[type] = null;
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
      <div class="keywords__section keywords__section--active keywords__section--dashboard">
        <header class="section__header">
          <div class="keywords__main-title-container section__title">
            <h2>Keywords Analysis</h2>
            <button class="keywords__button--refresh" type="button" aria-describedby="refresh-description">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__icon--medium keywords__icon--middle-align">
                <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="keywords__refresh-description">
            The analysis is performed on a static copy of the DOM to ensure consistency across all keywords. If you've made dynamic changes to the page, click the refresh button to update the analysis.
          </p>
          <div class="header__tabs">
            <button data-section="general" class="ri-arrow-go-back-line section__button section__button--back">
              <span class="visually-hidden">Back to general</span>
            </button>
            <button data-tab="overview" class="tab__button tab__button--active tab__button--overview">
              <span class="button__title">Overview</span>
            </button>
            <button data-tab="settings" class="tab__button tab__button--settings">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w3ba11y__settings-icon" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span class="button__title">Settings</span>   
            </button>
          </div>
        </header>
        <div class="section__body"></div>
      </div>
    `;

    const existingKeywordSection = asideBody.querySelector('.w3ba11y__section--keyword');
    if (existingKeywordSection)
      asideBody.removeChild(existingKeywordSection);
    asideBody.appendChild(keywordViewSection);

    this._header = keywordViewSection.querySelector('.section__header');
    this._body = keywordViewSection.querySelector('.section__body');
    this._tabButtons = keywordViewSection.querySelectorAll('.tab__button');
    this._refreshButton = keywordViewSection.querySelector('.keywords__button--refresh');
    this._activeTabButton = keywordViewSection.querySelector('.tab__button--overview');

    return keywordViewSection;
  }

  _renderOverviewItem({ title, tooltip, value, iconSvg, warningIconSvg }) {
    const id = title.toLowerCase().replace(/\s+/g, '-');
    return `
      <li class="keywords__overview-item">
        ${value ? iconSvg : warningIconSvg}
        <div class="keywords__overview-item__info-container">
          <div class="keywords__overview-item-header">
            <h3 class="keywords__overview-item-title">${title}</h3>
            <div class="keywords__tooltip-container">
              <div class="keywords__tooltip-trigger" tabindex="0" aria-describedby="${id}-tooltip">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon" aria-hidden="true">
                  <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                </svg>
              </div>  
              <span id="${id}-tooltip" role="tooltip" class="keywords__tooltip-text keywords--not-visible">
                ${tooltip}
              </span>              
            </div>
          </div>
          <div class="keywords__overview-item-body">
            <p class="keywords__overview-item-body__text">
              ${typeof value === 'string'
                ? (value ? Utils.escapeHTML(value) : 'Missing')
                : (value || value === 0 ? value : 'Missing')
              }
            </p>
          </div>
        </div>
      </li>
    `;
  }

  renderKeywordAnalysisOverview(overviewInfo) {
    let overviewContainer = this._body.querySelector('.keywords__overview-container');
    if (!overviewContainer) {
      overviewContainer = document.createElement('div');
      overviewContainer.classList.add('keywords__overview-container', 'tab', 'tab--active', 'tab--overview');
      overviewContainer.dataset.tab = 'overview';
      this._overviewTab = overviewContainer;
      this._body.appendChild(overviewContainer);
    }
    const warningIconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-icon--warning keywords__icon--large" aria-hidden="true">
        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
      </svg>
    `;
    overviewContainer.innerHTML = `
      <ul class="keywords__overview-list">
        ${this._renderOverviewItem({
          title: 'Meta Keywords',
          tooltip: `Google no longer uses meta keywords as a ranking factor. However, including them can be useful for compatibility or documentation reasons.`,
          value: overviewInfo.metaTagKeywordsContent?.trim() ?? '', 
          iconSvg: `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="keywords__overview-item-icon keywords__icon--small" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          `,
          warningIconSvg: warningIconSvg
        })}
        ${this._renderOverviewItem({
          title: 'Lang',
          tooltip: `The language specified in the html tag.`,
          value: overviewInfo.lang?.trim() ?? '',
          iconSvg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-item-icon keywords__icon--small" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 2.25a.75.75 0 0 1 .75.75v1.506a49.384 49.384 0 0 1 5.343.371.75.75 0 1 1-.186 1.489c-.66-.083-1.323-.151-1.99-.206a18.67 18.67 0 0 1-2.97 6.323c.318.384.65.753 1 1.107a.75.75 0 0 1-1.07 1.052A18.902 18.902 0 0 1 9 13.687a18.823 18.823 0 0 1-5.656 4.482.75.75 0 0 1-.688-1.333 17.323 17.323 0 0 0 5.396-4.353A18.72 18.72 0 0 1 5.89 8.598a.75.75 0 0 1 1.388-.568A17.21 17.21 0 0 0 9 11.224a17.168 17.168 0 0 0 2.391-5.165 48.04 48.04 0 0 0-8.298.307.75.75 0 0 1-.186-1.489 49.159 49.159 0 0 1 5.343-.371V3A.75.75 0 0 1 9 2.25ZM15.75 9a.75.75 0 0 1 .68.433l5.25 11.25a.75.75 0 1 1-1.36.634l-1.198-2.567h-6.744l-1.198 2.567a.75.75 0 0 1-1.36-.634l5.25-11.25A.75.75 0 0 1 15.75 9Zm-2.672 8.25h5.344l-2.672-5.726-2.672 5.726Z" clip-rule="evenodd" />
            </svg> 
          `,
          warningIconSvg: warningIconSvg
        })}
        ${this._renderOverviewItem({
          title: 'Word Count',
          tooltip: `The total number of words in the page's Document Object Model (DOM).`,
          value: overviewInfo.wordCount ?? 0,
          iconSvg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-item-icon keywords__icon--small" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
          `,
          warningIconSvg: warningIconSvg
        })}
        ${this._renderOverviewItem({
          title: 'Unique Word Count',
          tooltip: `The total number of unique words in the page's Document Object Model (DOM).`,
          value: overviewInfo.uniqueWordCount ?? 0,
          iconSvg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__overview-item-icon keywords__icon--small" aria-hidden="true">
              <path fill-rule="evenodd" d="M12 3.75a6.715 6.715 0 0 0-3.722 1.118.75.75 0 1 1-.828-1.25 8.25 8.25 0 0 1 12.8 6.883c0 3.014-.574 5.897-1.62 8.543a.75.75 0 0 1-1.395-.551A21.69 21.69 0 0 0 18.75 10.5 6.75 6.75 0 0 0 12 3.75ZM6.157 5.739a.75.75 0 0 1 .21 1.04A6.715 6.715 0 0 0 5.25 10.5c0 1.613-.463 3.12-1.265 4.393a.75.75 0 0 1-1.27-.8A6.715 6.715 0 0 0 3.75 10.5c0-1.68.503-3.246 1.367-4.55a.75.75 0 0 1 1.04-.211ZM12 7.5a3 3 0 0 0-3 3c0 3.1-1.176 5.927-3.105 8.056a.75.75 0 1 1-1.112-1.008A10.459 10.459 0 0 0 7.5 10.5a4.5 4.5 0 1 1 9 0c0 .547-.022 1.09-.067 1.626a.75.75 0 0 1-1.495-.123c.041-.495.062-.996.062-1.503a3 3 0 0 0-3-3Zm0 2.25a.75.75 0 0 1 .75.75c0 3.908-1.424 7.485-3.781 10.238a.75.75 0 0 1-1.14-.975A14.19 14.19 0 0 0 11.25 10.5a.75.75 0 0 1 .75-.75Zm3.239 5.183a.75.75 0 0 1 .515.927 19.417 19.417 0 0 1-2.585 5.544.75.75 0 0 1-1.243-.84 17.915 17.915 0 0 0 2.386-5.116.75.75 0 0 1 .927-.515Z" clip-rule="evenodd" />
            </svg>
          `,
          warningIconSvg: warningIconSvg
        })}
      </ul>
    `;
  }

  renderKeywordSettings(colorMap) {
    let settingsContainer = this._body.querySelector('.keywords__settings-container');
    if (!settingsContainer) {
      settingsContainer = document.createElement('div');
      settingsContainer.classList.add('keywords__settings-container', 'tab', 'tab--settings');
      settingsContainer.dataset.tab = 'settings';
      this._settingsTab = settingsContainer;
      this._body.appendChild(settingsContainer);
    }
    settingsContainer.innerHTML = `
      <h3 class="keywords__settings-title">Highlight keywords</h3>
      <div class="keywords__settings-item__title-container">
        <h4 class="keywords__settings-item__title">Customize tags color</h4>
        <div class="keywords__tooltip-container">
          <div class="keywords__tooltip-trigger" tabindex="0" aria-describedby="tags-color-tooltip">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon" aria-hidden="true">
              <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
            </svg>
          </div>  
          <span id="tags-color-tooltip" role="tooltip" class="keywords__tooltip-text keywords--not-visible">Customize the colors used to highlight keywords based on the parent tag.</span>                              
        </div>
      </div>
      <ul class="keywords__tag-color-options">
      ${Object.entries(colorMap)
        .map(([key, value]) => {
          return `
            <li class="keywords__tag-color-options__item">
              <h5 class="keywords__settings-item__title">${key}</h5>
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
        }).join('')
      }
      </ul>
    `;

    this._colorInputs = settingsContainer.querySelectorAll('.keywords__color-selector__input');
  }

  renderKeywordInputBox() { 
    let keywordInputContainer = this._body.querySelector('.keywords__input-container');
    if (!keywordInputContainer) {
      keywordInputContainer = document.createElement('div');
      keywordInputContainer.classList.add('keywords__input-container');
      this._body.appendChild(keywordInputContainer);
    }
    keywordInputContainer.innerHTML = `
      <label for="custom-keyword-input"><strong>Insert keyword:</strong></label>
      <div class="keywords__analyze-box">
        <div class="keywords__input-wrapper">
          <span class="keywords__input-wrapper__prefix">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="keywords__icon--block keywords__icon--small" aria-hidden="true">
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

    this._customKeywordInput = keywordInputContainer.querySelector('#custom-keyword-input');
    this._keywordHighlightCheckbox = keywordInputContainer.querySelector("#highlight-input-keyword");
    this._analyzeButton = keywordInputContainer.querySelector('.keywords__analyze-button');
  }

  renderKeywordListContainer(keywordListInfo, getActiveHighlightData) {
    const keywordListView = this.createListView(keywordListInfo, getActiveHighlightData);

    let allKeywordListContainer = this._container.querySelector('.keyword-all-lists__container');
    if (!allKeywordListContainer) {
      allKeywordListContainer = document.createElement('div');
      allKeywordListContainer.classList.add('keyword-all-lists__container');
      this._body.appendChild(allKeywordListContainer);
    }

    const existing = allKeywordListContainer.querySelector(`[data-list-type="${keywordListInfo.type}"]`);
    if (!existing) {
      if (keywordListInfo.type === 'userAdded') {
        allKeywordListContainer.prepend(keywordListView.container);
      } else {
        allKeywordListContainer.appendChild(keywordListView.container);
      }
    }

    keywordListView.render(keywordListInfo.keywords, keywordListInfo.totalPages);
  }

  renderKeywordDetails(keywordItem, getActiveHighlightData) {
    if (!this._analysisResultView) {
      this._analysisResultView = new AnalysisResultView(getActiveHighlightData);

      const existing = this._container.querySelector('.keywords__section--result');
      if (existing)
        this._container.removeChild(existing);
      this._container.appendChild(this._analysisResultView.container);
    }
    this._analysisResultView.render(keywordItem);
  }

  render(overviewInfo, colorMap) {
    this.renderKeywordAnalysisOverview(overviewInfo);
    this.renderKeywordSettings(colorMap);
    this.renderKeywordInputBox();
  }

  toggleSection(section) {
    this.getAllSection().forEach(section => section.classList.remove('keywords__section--active'));
    this.getSection(section)?.classList.add('keywords__section--active');
    const anchor = document.querySelector('.w3ba11y__header');
    if (anchor) {
      anchor.scrollIntoView();
    }
  }

  showTooltip(event) {
    const tooltipText = event.target.closest('.keywords__tooltip-container')?.querySelector('.keywords__tooltip-text');
    if (!tooltipText) return;
    tooltipText.classList.remove('keywords--not-visible');
  }

  hideTooltip(event) {
    const tooltipText = event.target.closest('.keywords__tooltip-container')?.querySelector('.keywords__tooltip-text');
    if (!tooltipText) return;
    tooltipText.classList.add('keywords--not-visible');
  }

  hideAllTooltips() {
    this.tooltips.forEach(tooltip => tooltip.classList.add('keywords--not-visible'));
  }

  changeTab(clickedButton) {
    if (this._activeTabButton === clickedButton)
      return;

    this._activeTabButton = clickedButton;
    this._container.querySelector('.tab__button--active').classList.remove('tab__button--active');
    this._container.querySelector('.tab--active').classList.remove('tab--active');
    this._activeTabButton.classList.add('tab__button--active');
    this._container.querySelector(`.tab--${clickedButton.dataset.tab}`).classList.add('tab--active');
  }

  isButtonActive(clickedButton) {
    return clickedButton.classList.contains('keyword-button--highlight--active');
  }

  setActiveButton(clickedButton) {
    this.activeHighlightButton?.classList.remove('keyword-button--highlight--active');
    clickedButton.classList.add('keyword-button--highlight--active');
  }

  clearActiveButton() {
    this.activeHighlightButton?.classList.remove('keyword-button--highlight--active');
  }

  getAllSection() {
    return this._container.querySelectorAll('.keywords__section');
  }

  getSection(section) {
    return this._container.querySelector(`.keywords__section--${section}`);
  }

  clearHighlightCheckbox() {
    this._keywordHighlightCheckbox.checked = false;
  }

  clearCustomKeywordInput() {
    this._customKeywordInput.value = '';
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordView;
}
