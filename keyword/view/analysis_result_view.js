class AnalysisResultView {
  constructor(getActiveHighlightedKeyword, getActiveHighlightSource) {
    this._container = this.generateAnalysisResultViewSection();
    this._header;
    this._body;
    this._getActiveHighlightedKeyword = getActiveHighlightedKeyword;
    this._getActiveHighlightSource = getActiveHighlightSource;
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

  get tooltipsTrigger() {
    return this._container.querySelectorAll('.keywords__tooltip-trigger');
  }

  get tooltips() {
    return this._container.querySelectorAll('.keywords__tooltip-text');
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

  render(keywordItem) {
    let analysisResultContainer = this._body.querySelector('.keywords__analysis-container');
    if (!analysisResultContainer) {
      analysisResultContainer = document.createElement("div");
      analysisResultContainer.classList.add("keywords__analysis-container");
      this._body.appendChild(analysisResultContainer);
    }
    this._currentKeywordItem = keywordItem;
    const isHighlighted = (
      this._getActiveHighlightedKeyword() === keywordItem &&
      this._getActiveHighlightSource() === 'result'
    );
    const highlightClass = isHighlighted ? 'keyword-button--highlight--active' : '';
    analysisResultContainer.innerHTML = `
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Keyword:</h3>
        <div class="keywords__analysis-item__action-container">
          <p>${Utils.escapeHTML(keywordItem.name)}</p>
          <button class="keywords__analysis-item__button keyword-button--highlight ${highlightClass}" data-keyword-source="result">
            <span class="visually-hidden">Highlight keyword</span>
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="keywords__icon--middle-align keywords__icon--medium" aria-hidden="true"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M315 315l158.4-215L444.1 70.6 229 229 315 315zm-187 5s0 0 0 0l0-71.7c0-15.3 7.2-29.6 19.5-38.6L420.6 8.4C428 2.9 437 0 446.2 0c11.4 0 22.4 4.5 30.5 12.6l54.8 54.8c8.1 8.1 12.6 19 12.6 30.5c0 9.2-2.9 18.2-8.4 25.6L334.4 396.5c-9 12.3-23.4 19.5-38.6 19.5L224 416l-25.4 25.4c-12.5 12.5-32.8 12.5-45.3 0l-50.7-50.7c-12.5-12.5-12.5-32.8 0-45.3L128 320zM7 466.3l63-63 70.6 70.6-31 31c-4.5 4.5-10.6 7-17 7L24 512c-13.3 0-24-10.7-24-24l0-4.7c0-6.4 2.5-12.5 7-17z"/></svg>
          </button>
        </div>
      </div>
      <div class="keywords__analysis-item">
        <div class="keywords__analysis-item__title-container">
          <h3 class="keywords__analysis-item__title">Structural importance score:</h3>
          <div class="keywords__tooltip-container">
            <div class="keywords__tooltip-trigger" tabindex="0" aria-describedby="keyword-score-tooltip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon" aria-hidden="true">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
              </svg>
            </div>      
            <span id="keyword-score-tooltip" role="tooltip" class="keywords__tooltip-text keywords--not-visible">The structural importance score highlights the impact of a keyword in strategic points of the page (title, meta description, H1-H6 tags, links, image alt attribute).</span>                        
          </div>
        </div>  
        <div class="keywords__score-container">
          <p class="keywords__score">${keywordItem.relevanceScore}</p>
        </div>
      </div>
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Frequency:</h3>
        <p>${keywordItem.frequency}</p>
      </div>
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Density:</h3>
        <p>${keywordItem.density}%</p>
      </div>
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Tag occurrences:</h3>
        <ul class="keywords_tag-occurrences-list">
        ${Object.entries(keywordItem.keywordOccurrences)
          .map(([key, value]) => 
            `<li class="keywords_tag-occurrences-item">
              <h4 class="keywords_tag-occurrences-item__title">${key}</h4>
              <p class="keywords_tag-occurrences-item__content">${value}</p>
            </li>`)
          .join('')}
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
