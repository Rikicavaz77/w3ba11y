let interfaceInstance;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const initializeInterface = (location) => {
    chrome.runtime.sendMessage({ action: "insertCSS", style: "css.css" });

    interfaceInstance = new Interface(location);
    interfaceInstance.render();

    interfaceInstance.iframe.contentWindow.addEventListener('load', function () {
      let currentUrl = interfaceInstance.iframe.contentWindow.location.href.split('#')[0];
      interfaceInstance.iframeDoc = interfaceInstance.iframe.contentDocument || interfaceInstance.iframe.contentWindow.document;
      interfaceInstance.iframeDoc.addEventListener('click', (e) => {
        let target = e.target.closest('a');
        if (target) {
          e.preventDefault();
          document.removeEventListener('click', handleSectionClick);
          window.top.location.href = target.href; 
        }
        else {
          let urlCheck = false;
          let urlCounter = 0;
          const maxAttempts = 5;
          const intervalId = setInterval(() => {
            const newUrl = interfaceInstance.iframe.contentWindow.location.href.split('#')[0];
            urlCounter++;
        
            if (currentUrl !== newUrl && newUrl !== 'about:blank') {
              document.removeEventListener('click', handleSectionClick);
              chrome.runtime.sendMessage({ action: "run", location: newUrl });
              currentUrl = newUrl;
              urlCheck = true;
            }
        
            if (urlCheck || urlCounter >= maxAttempts) {
              clearInterval(intervalId);
            }
          }, 300);
        }
      });

      setTimeout(() => {
        chrome.runtime.sendMessage({ action: "runComponents" });
      }, 3000);
    });
  };

  const handleSectionClick = (e) => {
    const target = e.target.closest('.section__button');
    if (target) {
      interfaceInstance.getAllSection().forEach(section => section.classList.remove('w3ba11y__section--active'));
      interfaceInstance.getSection(target.dataset.section)?.classList.add('w3ba11y__section--active');
    }
  }
  
  const setupListeners = () => {
    let clickListenerAdded = false;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'finishedComponents':
          interfaceInstance.removeSectionLoading(message.component);
          if (interfaceInstance.getAllSectionLoading().length === 0) {
            interfaceInstance.removeLoading();
            if (!clickListenerAdded) {
              document.addEventListener('click', handleSectionClick);
              clickListenerAdded = true;
            }
          }
          break;
      }
    });
  };

  switch (message.action) {
    case 'run':
      if (document.readyState === 'complete') {
        initializeInterface(message.location ? message.location : window.location.href);
        setupListeners();
      } else {
        window.addEventListener('load', () => {
          initializeInterface(message.location ? message.location : window.location.href);
          setupListeners();
        });
      }
      break;
    case 'stop':
      window.top.location.href = window.location.href;
      break;
  }
});

chrome.runtime.sendMessage({ action: 'isActive' });
