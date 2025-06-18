chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let iframe;
  let controller;

  if (message.action === 'runComponents') {
    iframe = document.querySelector('main').shadowRoot.querySelector('iframe').contentDocument;
    controller = new KeywordController(iframe);
    window.keywordController = controller;
    chrome.runtime.sendMessage({ action: 'finishedComponents', component: 'keyword' });
  }

  if (message.action === 'updateComponents') {
    iframe = document.querySelector('main').shadowRoot.querySelector('iframe').contentDocument;
    controller = window.keywordController;
    if (controller)
      controller.update(iframe, true);
  }
});
