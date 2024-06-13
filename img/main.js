chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let iframe;
  let view;
  let controller;

  switch (message.action) {
    case 'runComponents':
      if (message.isFirst) {
        iframe = document.querySelector('main').shadowRoot.querySelector('iframe').contentDocument;
        view = new ImgView(iframe);
        controller = new ImgController(view);
      }
      else {
        iframe = document.querySelector('main').shadowRoot.querySelector('iframe');
        window.location.href = iframe.contentWindow.location;
      }
      break; 
  }
});