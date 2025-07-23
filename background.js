chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;

  chrome.storage.local.get([tabId.toString()], (result) => {
    if (result[tabId]) {
      chrome.storage.local.remove(tabId.toString(), () => {
        console.log(`Tab ${tabId} is now inactive`);
      });

      chrome.tabs.sendMessage(tabId, { action: 'stop' });
    }
    else {
      chrome.storage.local.set({ [tabId]: true }, () => {
        console.log(`Tab ${tabId} is now active`);
      });
    
      chrome.tabs.sendMessage(tabId, { action: 'run' });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab.id;

  chrome.storage.local.get([tabId.toString()], (result) => {
    if (result[tabId]) {
      switch (message.action) {
        case 'insertCSS':
          chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: [message.style]
          });
          break;
        case 'isActive':
          chrome.tabs.sendMessage(tabId, { action: result[tabId] ? 'run' : 'stop' });
          break;
        case 'update':
            chrome.tabs.sendMessage(tabId, { action: 'updateComponents', location: message.location });
            break;
        case 'run':
          chrome.tabs.sendMessage(tabId, { action: 'run', location: message.location });
          break;
        case 'runComponents':
          chrome.tabs.sendMessage(tabId, { action: 'runComponents' });
          break;
        case 'updateComponents':
          chrome.tabs.sendMessage(tabId, { action: 'updateComponents' });
          break;
        case 'finishedComponents':
          chrome.tabs.sendMessage(tabId, { action: 'finishedComponents', component: message.component });
          break;
        case 'fetchImageSize':
          fetchImageSize(message.src, tabId);
          break;
        case 'stop':
          chrome.storage.local.remove(tabId.toString(), () => {
            console.log(`Tab ${tabId} is now inactive`);
          });
          
          chrome.tabs.sendMessage(tabId, { action: 'stop' });
          break;
      }
    }
  });
});

function fetchImageSize(src, tabId) {
  fetch(src, {
      method: 'HEAD'
    })
    .then((res) => {
      if (!res.ok) {
        fetch(src).then(res2 => {
          if (!res2.ok)
            chrome.tabs.sendMessage(tabId, {
              action: "fetchImageSizeResponse",
              src: src,
              size: 0
            });
          else
            chrome.tabs.sendMessage(tabId, {
              action: "fetchImageSizeResponse",
              src: src,
              size: res2.headers.get("Content-Length")
            });
        });
      } else
        chrome.tabs.sendMessage(tabId, {
          action: "fetchImageSizeResponse",
          src: src,
          size: res.headers.get("Content-Length")
        });
    })
    .catch(function (error) {
      chrome.tabs.sendMessage(tabId, {
        action: "fetchImageSizeResponse",
        src: src,
        size: 0
      });
    });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(tabId.toString(), () => {
    console.log(`Tab ${tabId} is now inactive`);
  });
});
