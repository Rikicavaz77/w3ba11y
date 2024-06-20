chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let iframe;
  let controller;

  if (message.action === 'runComponents') {
    iframe = document.querySelector('main').shadowRoot.querySelector('iframe').contentDocument;
    controller = new ImgController(iframe);
    window.imgController = controller;
    chrome.runtime.sendMessage({ action: 'finishedComponents', component: 'img' });
  }

  if (message.action === 'updateComponents') {
    iframe = document.querySelector('main').shadowRoot.querySelector('iframe').contentDocument;
    controller = window.imgController;
    if (controller)
      controller.update(iframe);
  }
});