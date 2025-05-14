class AnalysisResultView {
  constructor() {
    this._container = this.generateAnalysisResultViewSection();
    this._header;
    this._body;
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
    analysisResultContainer.innerHTML = `
      <div class="keywords__analysis-item">
        <h3 class="keywords__analysis-item__title">Keyword:</h3>
        <p>${keywordItem.name}</p>
      </div>
      <div class="keywords__analysis-item">
        <div class="keywords__analysis-item__title-container">
          <h3 class="keywords__analysis-item__title">Structural importance score:</h3>
          <div class="keywords__tooltip" tabindex="0" aria-describedby="keyword-score-tooltip">
            <div class="keywords__tooltip-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="keywords__tooltip-icon keywords__icon--micro">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
              </svg>    
              <span id="keyword-score-tooltip" class="keywords__tooltip-text keywords--not-visible">The structural importance score highlights the impact of a keyword in strategic points of the page (title, meta description, H1-H6 tags, links, image alt attribute).</span>
            </div>                            
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
              <h4 class="keywords_tag-occurrences-item__title">${key.toUpperCase()}</h4>
              <p class="keywords_tag-occurrences-item__content">${value}</p>
            </li>`)
          .join('')}
        </ul>
      </div>
    `;
  }
}