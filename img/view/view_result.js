class ImgViewResult {
  constructor(container) {
    this._container = this.generateImgViewResultSection(container);
    this._filterButtons;
  }

  get container() {
    return this._container;
  }

  get filterButtons() {
    return this._filterButtons;
  }

  set filterButtons(buttons) {
    this._filterButtons = buttons;
  }

  generateImgViewResultSection(container) {
    const tabContainer = container.querySelector('.tab--results');

    tabContainer.innerHTML = `
      <h2>Results</h2>
      <div class="hlist">
        <h3>Errors</h3>
        <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="20px" height="20px" alt="Loading images errors">
      </div>
      <div class="hlist">
        <h3>Warnings</h3>
        <img src="${chrome.runtime.getURL('/static/img/loading.gif')}" width="20px" height="20px" alt="Loading images warnings">
      </div>`;
    
    return tabContainer;
  }

  render(errors, warnings) {
    const groupByTitle = (statuses) => {
      return statuses.reduce((acc, status) => {
        if (!acc[status.title])
          acc[status.title] = [];
        acc[status.title].push(status);
        return acc;
      }, {});
    };

    const groupedErrors = groupByTitle(errors);
    const groupedWarnings = groupByTitle(warnings);

    const generateStatusHTML = (groupedStatuses, statusType) => {
      return Object.keys(groupedStatuses).map(title => {
        const messageCount = {};
        groupedStatuses[title].forEach(status => {
          const message = status.message;
          messageCount[message] ? messageCount[message]++ : messageCount[message] = 1;
        });

        const statusItems = Object.keys(messageCount).map(message => `
          <li class="hlist">
              ${message} (Total: ${messageCount[message]})
              <button data-status="${statusType}" data-title="${title}" data-message="${message}"
               class="ri-filter-fill filter__button"><span class="visually-hidden"> Filter by ${message}</span></button>
          </li>
        `).join('');
        const count = groupedStatuses[title].length;

        return `
          <div class="hlist">
            <span class="status status--${statusType}"></span>
            <span>${title} (Total: ${count})</span>
            <button data-status="${statusType}" data-title="${title}"
             class="ri-filter-fill filter__button"><span class="visually-hidden"> Filter by ${title}</span></button>
          </div>
          <ul>
            ${statusItems}
          </ul>
        `;
      }).join('');
    };

    const groupedErrorsHTML = generateStatusHTML(groupedErrors, 'error');
    const groupedWarningsHTML = generateStatusHTML(groupedWarnings, 'warning');

    this.container.innerHTML = `
      <h2>Results</h2>
      <div>
        <div class="hlist">
          <h3>Errors</h3>
          <button data-status="error" class="ri-filter-fill filter__button"><span class="visually-hidden"> Filter by errors</span></button>
        </div>
        ${groupedErrorsHTML}
      </div>
      <div>
        <div class="hlist">
          <h3>Warnings</h3>
          <button data-status="warning" class="ri-filter-fill filter__button"><span class="visually-hidden"> Filter by warnings</span></button>
        </div>
        ${groupedWarningsHTML}
      </div>`;
    
    this.filterButtons = this.container.querySelectorAll('.filter__button');
  }
}