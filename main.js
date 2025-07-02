let interfaceInstance;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const initializeInterface = (location) => {
    chrome.runtime.sendMessage({ action: "insertCSS", style: "css.css" });

    interfaceInstance = new Interface(location);
    interfaceInstance.render();
    addGlobalListeners();

    interfaceInstance.iframe.contentWindow.addEventListener('load', function () {
      let currentUrl = interfaceInstance.iframe.contentWindow.location.href.split('#')[0];
      interfaceInstance.iframeDoc = interfaceInstance.iframe.contentDocument || interfaceInstance.iframe.contentWindow.document;
      interfaceInstance.iframeDoc.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target) {
          const href = target.getAttribute('href');

          if (
            href === null ||
            href.startsWith('javascript:') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('blob:') ||
            href.startsWith('ftp:') ||
            href.startsWith('#')
          ) {
            return;
          }

          e.preventDefault();
          removeGlobalListeners();
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
              removeGlobalListeners();
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
      
      chrome.runtime.sendMessage({ action: "runComponents" });
    });
  };

  const handleSectionClick = (e) => {
    const target = e.target.closest('.section__button:not([data-loading="true"])');
    if (target) {
      interfaceInstance.getAllSection().forEach(section => section.classList.remove('w3ba11y__section--active'));
      interfaceInstance.getSection(target.dataset.section)?.classList.add('w3ba11y__section--active');
      const anchor = interfaceInstance.header;
      anchor?.scrollIntoView();
    }
  };

  const handleCloseClick = (e) => {
    console.log('Click detected:', e.target);
    const closeBtn = e.target.closest('.w3ba11y__close-button');
    if (closeBtn) {
      console.log('Close button clicked');
      chrome.runtime.sendMessage({ action: 'stop' });
    }
  };
  
  const addGlobalListeners = () => {
    console.log('[addGlobalListeners] Adding event listeners...');
    document.addEventListener('click', handleCloseClick);
    document.addEventListener('click', handleSectionClick);
  };

  const removeGlobalListeners = () => {
    document.removeEventListener('click', handleCloseClick);
    document.removeEventListener('click', handleSectionClick);
  };

  switch (message.action) {
    case 'run':
      if (document.readyState === 'complete') {
        initializeInterface(message.location ? message.location : window.location.href);
      } else {
        window.addEventListener('load', () => {
          initializeInterface(message.location ? message.location : window.location.href);
        });
      }
      break;
    case 'stop':
      console.log('Received "stop" action');
      try {
        window.location.reload();
      } catch (e) {
        console.log('Reload failed, fallback triggered.');
        window.top.location.href = window.location.href;
      }
      break;
    case 'finishedComponents':
      if (interfaceInstance) {
        interfaceInstance.removeSectionLoading(message.component);
      }
      break;
  }
});

chrome.runtime.sendMessage({ action: 'isActive' });
