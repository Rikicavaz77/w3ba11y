class AnalysisResultView {
  constructor(getActiveHighlightData) {
    this._getActiveHighlightData = getActiveHighlightData;
    this._header = null;
    this._body = null;
    this._currentKeywordItem = null;
    this._container = this.generateAnalysisResultViewSection();
  }

  get container() {
    return this._container;
  }

  get header() {
    return this._header;
  }

  get body() {
    return this._body;
  }

  get currentKeywordItem() {
    return this._currentKeywordItem;
  }

  generateAnalysisResultViewSection() {
    const keywordDetailsViewSection = document.createElement('div');
    keywordDetailsViewSection.classList.add('keywords__section', 'keywords__section--result');
    keywordDetailsViewSection.innerHTML = `
      <header class="section__header">
        <h2 class="section__title">Keywords Analysis Result</h2>
        <div class="header__tabs">
          <button data-section="dashboard" class="ri-arrow-go-back-line keywords__section__button keywords__section__button--back">
            <span class="visually-hidden">Back to general</span>
          </button>
        </div>
      </header>
      <div class="section__body"></div>
    `;

    this._header = keywordDetailsViewSection.querySelector('.section__header');
    this._body = keywordDetailsViewSection.querySelector('.section__body');

    return keywordDetailsViewSection;
  }

  _getHighlightClass() {
    const { keyword, source } = this._getActiveHighlightData();
    const isHighlighted = (
      keyword === this._currentKeywordItem &&
      source === 'result'
    );
    return isHighlighted ? 'keyword-button--highlight--active' : '';
  }

  _renderWarningIconIfNeeded(frequency) {
    if (frequency !== 0) return '';
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keyword-frequency-icon--error keywords__icon--medium keywords__icon--inline" aria-hidden="true">
        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
      </svg>
    `;
  }

  render(keywordItem) {
    let analysisResultContainer = this._body.querySelector('.keywords__analysis-container');
    if (!analysisResultContainer) {
      analysisResultContainer = document.createElement('div');
      analysisResultContainer.classList.add('keywords__analysis-container');
      this._body.appendChild(analysisResultContainer);
    }
    this._currentKeywordItem = keywordItem;
    const highlightClass = this._getHighlightClass();
    const safeFrequency = Number.isFinite(+keywordItem.frequency) ? keywordItem.frequency : 0;
    const safeDensity = Number.isFinite(+keywordItem.density) ? keywordItem.density : 0;

    analysisResultContainer.innerHTML = `
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Keyword:</h3>
        <div class="keywords__analysis-item__action-container">
          <span class="keyword-name">${Utils.escapeHTML(keywordItem.name)}</span>
          <button class="keywords__analysis-item__button keyword-button--highlight ${highlightClass}" data-keyword-source="result">
            <span class="visually-hidden">Highlight keyword</span>
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="keywords__icon--middle-align keywords__icon--medium" aria-hidden="true">
              <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
              <path d="M315 315l158.4-215L444.1 70.6 229 229 315 315zm-187 5s0 0 0 0l0-71.7c0-15.3 7.2-29.6 19.5-38.6L420.6 8.4C428 2.9 437 0 446.2 0c11.4 0 22.4 4.5 30.5 12.6l54.8 54.8c8.1 8.1 12.6 19 12.6 30.5c0 9.2-2.9 18.2-8.4 25.6L334.4 396.5c-9 12.3-23.4 19.5-38.6 19.5L224 416l-25.4 25.4c-12.5 12.5-32.8 12.5-45.3 0l-50.7-50.7c-12.5-12.5-12.5-32.8 0-45.3L128 320zM7 466.3l63-63 70.6 70.6-31 31c-4.5 4.5-10.6 7-17 7L24 512c-13.3 0-24-10.7-24-24l0-4.7c0-6.4 2.5-12.5 7-17z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Frequency:</h3>
        <span class="keywords__analysis-item__content">
          ${safeFrequency} ${this._renderWarningIconIfNeeded(safeFrequency)}
        </span>
      </div>
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Density:</h3>
        <span class="keywords__analysis-item__content">
          ${safeDensity}% ${this._renderWarningIconIfNeeded(safeDensity)}
        </span>
      </div>
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Tag occurrences:</h3>
        <ul class="keywords__tag-occurrences-list">
        ${Object.entries(keywordItem.keywordOccurrences)
          .map(([key, value]) => {
            const safeValue = Number.isFinite(+value) ? value : 0;
            return `
              <li class="keywords__tag-occurrences-item">
                <h4 class="keywords__tag-occurrences-item__title">${key}</h4>
                <span class="keywords__tag-occurrences-item__content">${safeValue}</span>
              </li>
            `;
          }).join('')
        }
        </ul>
      </div>
    `;
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = AnalysisResultView;
}
