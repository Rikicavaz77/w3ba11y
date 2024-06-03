chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab.id;

  if (message.action === 'insertCSS') {
      const style = message.style;
      chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: [style]
      });
  } else if (message.action === 'insertHTML') {
      chrome.tabs.sendMessage(tabId, { action: 'insertHTML' });
  }
});

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;
  chrome.tabs.sendMessage(tabId, { action: 'run' });
});
