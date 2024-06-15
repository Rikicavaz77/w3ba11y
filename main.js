window.addEventListener('load', () => {
  let interface;
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'run':
        if (!interface) {
          chrome.runtime.sendMessage({ action: "insertCSS", style: "css.css" });
          interface = new Interface();
          interface.render();
          interface.iframe.addEventListener('load', function() {
            chrome.runtime.sendMessage({ action: "runComponents" });
            try {
              interface.iframeDoc = interface.iframe.contentDocument || interface.iframe.contentWindow.document;
            } catch (error) {}
          });
        }
        else 
          window.location.reload();
        break;
    }
  });
});