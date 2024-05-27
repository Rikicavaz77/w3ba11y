let originalDocumentHTML = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'run') {
    if (!originalDocumentHTML) {
      originalDocumentHTML = document.documentElement.cloneNode(true);
    } else {
      location.reload();
      return;
    }
  
    const documentHTML = document.documentElement.cloneNode(true);
    injectCustomDOM(documentHTML);
    
    chrome.runtime.sendMessage({ action: "insertCSS", style: "css.css" });
    chrome.runtime.sendMessage({ action: "insertHTML", html: document.documentElement.innerHTML });
  }
});

function injectCustomDOM(documentHTML) {
  const DOM = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet"/>
        <link rel="stylesheet" href="css.css">
      </head>
      <body style="display:flex;">
        <aside class="cc" style="width:25%;"></aside>
        <main style="width:75%; contain: layout;"></main>
      </body>
    </html>
  `;

  document.documentElement.innerHTML = DOM;
  const main = document.querySelector('main');
  main.innerHTML = '';
  const shadowRoot = main.attachShadow({ mode: 'open' });
  shadowRoot.appendChild(documentHTML);

  const styleElement = document.createElement('style');
  styleElement.textContent = `.highlight { border: 4px solid red !important; }`;
  shadowRoot.appendChild(styleElement);
}
