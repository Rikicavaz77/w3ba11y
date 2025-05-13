class AnalysisResultView {
  constructor(container) {
    this._container = this.generateAnalysisResultViewSection(container);
  }

  get container() {
    return this._container;
  }

  generateAnalysisResultViewSection(container) {
    const keywordDetailsViewSection = document.createElement('section');
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

    container.appendChild(keywordDetailsViewSection);

    return keywordDetailsViewSection;
  }

  render(keywordItem) {

  }
}