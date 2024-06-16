chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let iframe;
  let view;
  let controller;

  if (message.action === 'runComponents') {
    iframe = document.querySelector('main').shadowRoot.querySelector('iframe').contentDocument;
    view = new ImgView(iframe);
    controller = new ImgController(view);
    window.imgController = controller;
  }

  if (message.action === 'updateComponents') {
    controller = window.imgController;
    if (controller)
      controller.update();
  }
});