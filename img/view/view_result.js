class ImgViewResult {
  constructor(container) {
    this._container = this.generateImgViewResultSection(container);
  }

  get container() {
    return this._container;
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
          </li>
        `).join('');
        const count = groupedStatuses[title].length;

        return `
          <div class="hlist">
            <span class="status status--${statusType}"></span>
            <span>${title} (Total: ${count})</span>
          </div>
          <ul>
            ${statusItems}
          </ul>
        `;
      }).join('');
    };

    const groupedErrorsHTML = generateStatusHTML(groupedErrors, 'error');
    const groupedWarningsHTML = generateStatusHTML(groupedWarnings, 'warning');

    this._container.innerHTML = `
      <h2>Results</h2>
      <div>
        <h3>Errors</h3>
        ${groupedErrorsHTML}
      </div>
      <div>
        <h3>Warnings</h3>
        ${groupedWarningsHTML}
      </div>`;
  }
}