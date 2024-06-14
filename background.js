let isFirst = true;

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;
  chrome.tabs.sendMessage(tabId, { action: 'run' });
  isFirst = true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab.id;

  switch (message.action) {
    case 'insertCSS':
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: [message.style]
      });
      break;
    case 'runComponents':
      chrome.tabs.sendMessage(tabId, { action: 'runComponents', isFirst: isFirst });
      isFirst = !isFirst;
      break;
    case 'fetchImageSize':
      fetchImageSize(message.src, tabId);
      break; 
  }
});

function fetchImageSize(src, tabId) {
  fetch(src, {
      method: 'HEAD'
    })
    .then((res) => {
      if (!res.ok) {
        fetch(src).then(res2=>{
          if (!res2.ok)
            chrome.tabs.sendMessage(tabId, {
              action: "fetchImageSizeResponse",
              src: src,
              size: 0
            })
          else
            chrome.tabs.sendMessage(tabId, {
              action: "fetchImageSizeResponse",
              src: src,
              size: res2.headers.get("Content-Length")
            })
        })
      }
      else
        chrome.tabs.sendMessage(tabId, {
          action: "fetchImageSizeResponse",
          src: src,
          size: res.headers.get("Content-Length")
        })
    })
    .catch(function (error) {
        chrome.tabs.sendMessage(tabId, {
            action: "fetchImageSizeResponse",
            src: src,
            size: 0
        })
    });
}