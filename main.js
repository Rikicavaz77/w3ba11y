chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let interfaceInstance;
  let observer;

  if (message.action === 'run') {
    const initializeInterface = () => {
      chrome.runtime.sendMessage({ action: "insertCSS", style: "css.css" });

      interfaceInstance = new Interface();
      interfaceInstance.render();
      interfaceInstance.iframe.addEventListener('load', function() {
        interfaceInstance.iframeDoc = interfaceInstance.iframe.contentDocument || interfaceInstance.iframe.contentWindow.document;
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "runComponents" });
          observeURLChanges();
        }, 3000);
      });
    };

    const observeURLChanges = () => {
      let lastURL = interfaceInstance.iframe.contentWindow.location.href;
      new MutationObserver(() => {
        const currentURL = interfaceInstance.iframe.contentWindow.location.href;
        if (currentURL !== lastURL) {
          window.location.href = currentURL;
        }
      }).observe(document, { subtree: true, childList: true });
    };

    if (document.readyState === 'complete')
      initializeInterface();
    else
      window.addEventListener('load', () => {
        initializeInterface();
      });
  }
});
